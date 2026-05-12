package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CustomerRequest;
import com.john.inflow.dto.response.CustomerActivityResponse;
import com.john.inflow.dto.response.CustomerDetailResponse;
import com.john.inflow.dto.response.CustomerResponse;
import com.john.inflow.dto.response.CustomerSummaryResponse;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.entity.Customer;
import com.john.inflow.entity.ReturnSalesInvoice;
import com.john.inflow.entity.SalesInvoice;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.CustomerMapper;
import com.john.inflow.repository.CustomerRepository;
import com.john.inflow.repository.ReturnSalesInvoiceRepository;
import com.john.inflow.repository.SalesInvoiceRepository;
import com.john.inflow.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final ReturnSalesInvoiceRepository returnSalesInvoiceRepository;

    public CustomerServiceImpl(
            CustomerRepository customerRepository,
            CustomerMapper customerMapper,
            SalesInvoiceRepository salesInvoiceRepository,
            ReturnSalesInvoiceRepository returnSalesInvoiceRepository
    ) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
        this.salesInvoiceRepository = salesInvoiceRepository;
        this.returnSalesInvoiceRepository = returnSalesInvoiceRepository;
    }

    @Override
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = customerMapper.toEntity(request);
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    @Override
    public CustomerDetailResponse getById(Integer id) {
        Customer customer = requireCustomer(id);
        BigDecimal totalSales = nullToZero(salesInvoiceRepository.sumByCustomerId(id));
        BigDecimal totalReturns = nullToZero(returnSalesInvoiceRepository.sumByCustomerId(id));
        long returnsCount = returnSalesInvoiceRepository.countByCustomerId(id);
        return new CustomerDetailResponse(
                customer.getId(),
                customerMapper.customerId(customer.getId()),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getStatus(),
                customer.getNotes(),
                totalSales,
                totalReturns,
                returnsCount,
                salesInvoiceRepository.findLastSaleAt(id),
                returnSalesInvoiceRepository.findLastReturnAt(id),
                customer.getCreatedAt(),
                customer.getDeactivatedAt(),
                salesInvoiceRepository.findRecentByCustomerId(id, PageRequest.of(0, 5)).stream()
                    .map(this::salesActivity)
                    .toList(),
                returnSalesInvoiceRepository.findRecentByCustomerId(id, PageRequest.of(0, 5)).stream()
                    .map(this::returnActivity)
                    .toList()
        );
    }

    @Override
    public PageResponse<CustomerResponse> getAll(
            String search,
            String status,
            String salesActivity,
            LocalDate createdFrom,
            LocalDate createdTo,
            int page,
            int size
    ) {
        Page<Customer> result = customerRepository.search(
                normalizeSearch(search),
                parseSearchId(search),
                normalizeStatus(status),
                normalizeSalesActivity(salesActivity),
                startOfDay(createdFrom),
                endOfDay(createdTo),
                PageRequest.of(Math.max(page, 0), Math.max(size, 1))
        );
        return PageResponse.of(result.map(this::toResponse));
    }

    @Override
    public CustomerSummaryResponse getSummary() {
        return new CustomerSummaryResponse(
                customerRepository.count(),
                customerRepository.countByStatus("ACTIVE"),
                salesInvoiceRepository.countCustomersWithSales(),
                returnSalesInvoiceRepository.countCustomersWithReturns()
        );
    }

    @Override
    @Transactional
    public CustomerResponse update(Integer id, CustomerRequest request) {
        Customer customer = requireCustomer(id);
        customerMapper.updateEntity(request, customer);
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CustomerResponse deactivate(Integer id) {
        Customer customer = requireCustomer(id);
        customer.setStatus("INACTIVE");
        customer.setDeactivatedAt(OffsetDateTime.now());
        return toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        deactivate(id);
    }

    private Customer requireCustomer(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    private CustomerResponse toResponse(Customer customer) {
        return customerMapper.toResponse(
                customer,
                nullToZero(salesInvoiceRepository.sumByCustomerId(customer.getId())),
                returnSalesInvoiceRepository.countByCustomerId(customer.getId())
        );
    }

    private CustomerActivityResponse salesActivity(SalesInvoice invoice) {
        return new CustomerActivityResponse(
                invoice.getId(),
                "INV-" + invoice.getId(),
                invoice.getCreatedAt(),
                invoice.getTotalPrice()
        );
    }

    private CustomerActivityResponse returnActivity(ReturnSalesInvoice invoice) {
        return new CustomerActivityResponse(
                invoice.getId(),
                "RET-" + invoice.getId(),
                invoice.getReturnedAt(),
                invoice.getTotalPrice()
        );
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }

    private Integer parseSearchId(String search) {
        if (search == null) return null;
        String digits = search.replaceAll("\\D", "");
        if (digits.isBlank()) return null;
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return null;
        return status.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeSalesActivity(String salesActivity) {
        if (salesActivity == null || salesActivity.isBlank()) return null;
        return salesActivity.trim().toUpperCase(Locale.ROOT).replace('-', '_');
    }

    private OffsetDateTime startOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay().atOffset(ZoneOffset.UTC);
    }

    private OffsetDateTime endOfDay(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC).minusNanos(1);
    }
}
