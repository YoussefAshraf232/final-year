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
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
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
        String normalizedSearch = normalizeSearch(search);
        String normalizedStatus = normalizeStatus(status);
        String normalizedSalesActivity = normalizeSalesActivity(salesActivity);
        OffsetDateTime createdFromStart = startOfDay(createdFrom);
        OffsetDateTime createdToEnd = endOfDay(createdTo);
        PageRequest pageRequest = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
        );
        Page<Customer> result = customerRepository.findAll(
                customerSpecification(
                        normalizedSearch,
                        normalizedStatus,
                        normalizedSalesActivity,
                        createdFromStart,
                        createdToEnd
                ),
                pageRequest
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

    private Specification<Customer> customerSpecification(
            String search,
            String status,
            String salesActivity,
            OffsetDateTime createdFrom,
            OffsetDateTime createdTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null) {
                String likeSearch = "%" + search.toLowerCase(Locale.ROOT) + "%";
                Integer searchId = parseSearchId(search);
                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(cb.like(cb.lower(root.get("name")), likeSearch));
                searchPredicates.add(cb.like(cb.lower(cb.coalesce(root.get("phone"), "")), likeSearch));
                searchPredicates.add(cb.like(cb.lower(cb.coalesce(root.get("email"), "")), likeSearch));
                if (searchId != null) {
                    searchPredicates.add(cb.equal(root.get("id"), searchId));
                }
                predicates.add(cb.or(searchPredicates.toArray(Predicate[]::new)));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
            }
            if (createdTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), createdTo));
            }
            if (salesActivity != null) {
                predicates.add(salesActivityPredicate(salesActivity, root, query, cb));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Predicate salesActivityPredicate(
            String salesActivity,
            Root<Customer> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb
    ) {
        return switch (salesActivity) {
            case "HAS_SALES" -> cb.exists(salesExistsSubquery(root, query, cb));
            case "NO_SALES" -> cb.not(cb.exists(salesExistsSubquery(root, query, cb)));
            case "HAS_RETURNS" -> cb.exists(returnExistsSubquery(root, query, cb));
            default -> cb.conjunction();
        };
    }

    private Subquery<Integer> salesExistsSubquery(Root<Customer> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<SalesInvoice> salesRoot = subquery.from(SalesInvoice.class);
        subquery.select(salesRoot.get("id"));
        subquery.where(cb.equal(salesRoot.get("customer"), root));
        return subquery;
    }

    private Subquery<Integer> returnExistsSubquery(Root<Customer> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<ReturnSalesInvoice> returnRoot = subquery.from(ReturnSalesInvoice.class);
        subquery.select(returnRoot.get("id"));
        subquery.where(cb.equal(returnRoot.get("customer"), root));
        return subquery;
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
