package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.request.ReceiveOrderRequest;
import com.john.inflow.dto.request.RejectOrderRequest;
import com.john.inflow.dto.request.item.PurchaseInvoiceItemRequest;
import com.john.inflow.dto.request.item.ReceiveOrderItemRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.dto.response.ReceiveSummaryResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.PurchaseInvoice;
import com.john.inflow.entity.PurchaseInvoiceProduct;
import com.john.inflow.entity.PurchaseInvoiceProductId;
import com.john.inflow.entity.Supplier;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.PurchaseInvoiceMapper;
import com.john.inflow.repository.ProductRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.PurchaseInvoiceProductRepository;
import com.john.inflow.repository.PurchaseInvoiceRepository;
import com.john.inflow.repository.SupplierRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.repository.WarehouseRepository;
import com.john.inflow.service.AuditLogService;
import com.john.inflow.service.PurchaseInvoiceService;
import com.john.inflow.service.StockMovementService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class PurchaseInvoiceServiceImpl implements PurchaseInvoiceService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final PurchaseInvoiceProductRepository purchaseInvoiceProductRepository;
    private final PurchaseInvoiceMapper purchaseInvoiceMapper;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    public PurchaseInvoiceServiceImpl(
            PurchaseInvoiceRepository purchaseInvoiceRepository,
            PurchaseInvoiceProductRepository purchaseInvoiceProductRepository,
            PurchaseInvoiceMapper purchaseInvoiceMapper,
            UserRepository userRepository,
            SupplierRepository supplierRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            ProductWarehouseRepository productWarehouseRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService) {
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.purchaseInvoiceProductRepository = purchaseInvoiceProductRepository;
        this.purchaseInvoiceMapper = purchaseInvoiceMapper;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public PurchaseInvoiceResponse create(CreatePurchaseInvoiceRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.supplierId()));

        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", request.warehouseId()));

        PurchaseInvoice invoice = purchaseInvoiceMapper.toEntity(request, user, supplier, warehouse);
        invoice.setTotalPrice(BigDecimal.ZERO);
        invoice.setReceiptStatus(isWarehouseManager(user) ? "PENDING_APPROVAL" : "PENDING_RECEIPT");
        PurchaseInvoice savedInvoice = purchaseInvoiceRepository.save(invoice);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (PurchaseInvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemRequest.productId()));
            BigDecimal expectedPrice = product.getCurrentPrice() != null ? product.getCurrentPrice() : BigDecimal.ZERO;
            if (itemRequest.price().compareTo(expectedPrice) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unit price for product " + product.getName() + " cannot exceed expected price " + expectedPrice);
            }

            PurchaseInvoiceProduct item = purchaseInvoiceMapper.itemToEntity(itemRequest, savedInvoice, product);
            purchaseInvoiceProductRepository.save(item);

            BigDecimal lineTotal = itemRequest.price().multiply(BigDecimal.valueOf(itemRequest.amount()));
            totalPrice = totalPrice.add(lineTotal);
        }

        savedInvoice.setTotalPrice(totalPrice);
        purchaseInvoiceRepository.save(savedInvoice);
        auditLogService.log(user, "CREATE", "PURCHASE_INVOICE", savedInvoice.getId(), "totalPrice=" + totalPrice + ",status=" + savedInvoice.getReceiptStatus());

        PurchaseInvoice refreshed = purchaseInvoiceRepository.findById(savedInvoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", savedInvoice.getId()));
        return purchaseInvoiceMapper.toResponse(refreshed);
    }

    @Override
    public PurchaseInvoiceResponse getById(Integer id) {
        PurchaseInvoice invoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", id));
        return purchaseInvoiceMapper.toResponse(invoice);
    }

    @Override
    public PageResponse<PurchaseInvoiceResponse> getAll(int page, int size) {
        return PageResponse.of(purchaseInvoiceRepository.findAll(PageRequest.of(page, size)).map(purchaseInvoiceMapper::toResponse));
    }

    @Override
    public PageResponse<PurchaseInvoiceResponse> search(
            String search,
            String receiptStatus,
            Integer supplierId,
            Integer warehouseId,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            int page,
            int size
    ) {
        return PageResponse.of(
                purchaseInvoiceRepository.search(
                        normalizeSearch(search),
                        normalizeStatus(receiptStatus),
                        supplierId,
                        warehouseId,
                        dateFrom,
                        dateTo,
                        PageRequest.of(page, size)
                ).map(purchaseInvoiceMapper::toResponse)
        );
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        var entity = purchaseInvoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", id));
        purchaseInvoiceRepository.delete(entity);
    }

    @Override
    @Transactional
    public PurchaseInvoiceResponse approve(Integer id, Integer userId) {
        PurchaseInvoice invoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", id));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!isOperationalApprover(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only operational managers can approve orders");
        }
        String currentStatus = invoice.getReceiptStatus();
        if (!"PENDING_APPROVAL".equals(currentStatus) && !"PENDING_RECEIPT".equals(currentStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending approval or unreceived orders can be approved");
        }
        int totalReceived = 0;
        for (PurchaseInvoiceProduct item : invoice.getPurchaseInvoiceProducts()) {
            int ordered = item.getAmount() != null ? item.getAmount() : 0;
            int alreadyReceived = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
            int damaged = item.getDamagedQuantity() != null ? item.getDamagedQuantity() : 0;
            int remainingReceivable = ordered - alreadyReceived - damaged;
            if (remainingReceivable <= 0) {
                continue;
            }

            addStock(item.getProduct(), invoice.getWarehouse(), remainingReceivable);
            stockMovementService.record(item.getProduct(), invoice.getWarehouse(),
                    "PURCHASE_RECEIPT", remainingReceivable, item.getPrice(),
                    "PURCHASE_INVOICE", invoice.getId(),
                    "Approve order #" + invoice.getId(), user);

            item.setReceivedQuantity(alreadyReceived + remainingReceivable);
            purchaseInvoiceProductRepository.save(item);
            totalReceived += remainingReceivable;
        }
        if (totalReceived <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No remaining ordered quantity to add to stock");
        }

        invoice.setReceiptStatus("RECEIVED");
        invoice.setReceivedAt(OffsetDateTime.now());
        invoice.setReceivedByUser(user);
        purchaseInvoiceRepository.save(invoice);
        auditLogService.log(user, "APPROVE", "PURCHASE_INVOICE", invoice.getId(), "received=" + totalReceived + ",status=RECEIVED");
        return purchaseInvoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public PurchaseInvoiceResponse receive(Integer id, ReceiveOrderRequest request, Integer userId) {
        PurchaseInvoice invoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", id));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if ("REJECTED".equals(invoice.getReceiptStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot receive a rejected order");
        }
        if ("PENDING_APPROVAL".equals(invoice.getReceiptStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Order must be approved before receiving stock");
        }

        Map<Integer, PurchaseInvoiceProduct> itemsByProduct = new HashMap<>();
        for (PurchaseInvoiceProduct it : invoice.getPurchaseInvoiceProducts()) {
            itemsByProduct.put(it.getProduct().getId(), it);
        }

        boolean anyChange = false;
        for (ReceiveOrderItemRequest req : request.items()) {
            PurchaseInvoiceProduct item = itemsByProduct.get(req.productId());
            if (item == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product " + req.productId() + " is not part of this purchase invoice");
            }

            int ordered = item.getAmount() != null ? item.getAmount() : 0;
            int newReceivedTotal = req.receivedQuantity() != null ? req.receivedQuantity() : 0;
            int newDamagedTotal = req.damagedQuantity() != null ? req.damagedQuantity() : 0;

            if (newReceivedTotal < 0 || newDamagedTotal < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantities cannot be negative");
            }
            if (newReceivedTotal + newDamagedTotal > ordered) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Received + damaged exceeds ordered for product " + req.productId());
            }

            int prevReceived = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
            int delta = newReceivedTotal - prevReceived;
            if (delta < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Received quantity cannot be reduced for product " + req.productId());
            }

            if (delta > 0) {
                addStock(item.getProduct(), invoice.getWarehouse(), delta);
                stockMovementService.record(item.getProduct(), invoice.getWarehouse(),
                        "PURCHASE_RECEIPT", delta, item.getPrice(),
                        "PURCHASE_INVOICE", invoice.getId(),
                        "Receive order #" + invoice.getId(), user);
                anyChange = true;
            }
            if (newDamagedTotal != (item.getDamagedQuantity() != null ? item.getDamagedQuantity() : 0)) {
                anyChange = true;
            }

            item.setReceivedQuantity(newReceivedTotal);
            item.setDamagedQuantity(newDamagedTotal);
            if (req.notes() != null) {
                item.setReceivingNotes(req.notes());
            }
            purchaseInvoiceProductRepository.save(item);
        }

        if (!anyChange) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No quantity changes to save");
        }

        if (request.notes() != null) {
            invoice.setReceivingNotes(request.notes());
        }

        String newStatus = computeStatus(invoice);
        invoice.setReceiptStatus(newStatus);
        if ("RECEIVED".equals(newStatus)) {
            invoice.setReceivedAt(request.receivingDate() != null ? request.receivingDate() : OffsetDateTime.now());
            invoice.setReceivedByUser(user);
        }
        purchaseInvoiceRepository.save(invoice);

        auditLogService.log(user, "RECEIVE", "PURCHASE_INVOICE", invoice.getId(),
                "mode=" + request.mode() + ",status=" + newStatus);

        PurchaseInvoice refreshed = purchaseInvoiceRepository.findById(invoice.getId())
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", invoice.getId()));
        return purchaseInvoiceMapper.toResponse(refreshed);
    }

    @Override
    @Transactional
    public PurchaseInvoiceResponse reject(Integer id, RejectOrderRequest request, Integer userId) {
        PurchaseInvoice invoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseInvoice", id));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        invoice.setReceiptStatus("REJECTED");
        String existing = invoice.getReceivingNotes();
        String reasonLine = "Rejected: " + request.reason() + (request.notes() != null ? " - " + request.notes() : "");
        invoice.setReceivingNotes(existing == null || existing.isBlank() ? reasonLine : existing + "\n" + reasonLine);
        purchaseInvoiceRepository.save(invoice);

        auditLogService.log(user, "REJECT", "PURCHASE_INVOICE", invoice.getId(),
                "reason=" + request.reason());

        return purchaseInvoiceMapper.toResponse(invoice);
    }

    @Override
    public ReceiveSummaryResponse getReceiveSummary() {
        long pending = purchaseInvoiceRepository.countByReceiptStatus("PENDING_RECEIPT");
        long totalReceived = purchaseInvoiceRepository.countByReceiptStatus("RECEIVED");
        long partial = purchaseInvoiceRepository.countByReceiptStatus("PARTIALLY_RECEIVED");
        long damaged = purchaseInvoiceRepository.countOrdersWithDamagedItems();
        return new ReceiveSummaryResponse(pending, totalReceived, partial, damaged);
    }

    private String computeStatus(PurchaseInvoice invoice) {
        if ("REJECTED".equals(invoice.getReceiptStatus())) return "REJECTED";
        int totalOrdered = 0, totalReceived = 0, totalDamaged = 0;
        for (PurchaseInvoiceProduct it : invoice.getPurchaseInvoiceProducts()) {
            totalOrdered += it.getAmount() != null ? it.getAmount() : 0;
            totalReceived += it.getReceivedQuantity() != null ? it.getReceivedQuantity() : 0;
            totalDamaged += it.getDamagedQuantity() != null ? it.getDamagedQuantity() : 0;
        }
        if (totalDamaged > 0 && totalReceived + totalDamaged < totalOrdered) return "DAMAGED_ITEMS";
        if (totalDamaged > 0 && totalReceived < totalOrdered) return "DAMAGED_ITEMS";
        if (totalReceived >= totalOrdered && totalDamaged == 0) return "RECEIVED";
        if (totalReceived > 0) return "PARTIALLY_RECEIVED";
        if (totalDamaged > 0) return "DAMAGED_ITEMS";
        return "PENDING_RECEIPT";
    }

    private void addStock(Product product, Warehouse warehouse, int amount) {
        ProductWarehouseId pwId = new ProductWarehouseId(product.getId(), warehouse.getId());
        ProductWarehouse pw = productWarehouseRepository.findById(pwId).orElse(null);
        if (pw == null) {
            pw = new ProductWarehouse();
            pw.setId(pwId);
            pw.setProduct(product);
            pw.setWarehouse(warehouse);
            pw.setAmount(amount);
        } else {
            pw.setAmount(pw.getAmount() + amount);
        }
        productWarehouseRepository.save(pw);
    }

    private String normalizeSearch(String search) {
        if (search == null) return null;
        String trimmed = search.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeStatus(String status) {
        if (status == null) return null;
        String trimmed = status.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isWarehouseManager(User user) {
        String role = user.getRole() != null ? user.getRole().getName() : null;
        return "WAREHOUSE_MANAGER".equals(role) || "EMPLOYEE".equals(role);
    }

    private boolean isOperationalApprover(User user) {
        String role = user.getRole() != null ? user.getRole().getName() : null;
        return "SYSTEM_ADMIN".equals(role)
                || "OPERATIONAL_MANAGER".equals(role)
                || "ADMIN".equals(role)
                || "MANAGER".equals(role);
    }
}
