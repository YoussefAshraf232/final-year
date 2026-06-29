# Recommended defense storyboard

Target 16–20 main slides for a 12–18 minute defense. Put dense technical detail in the appendix.

## Main deck

1. **Cover**  
   Official project title, team, supervisor, university, year, and one strong application visual.

2. **Roadmap**  
   Problem → solution → design → implementation → demonstration → evaluation.

3. **Operational problem**  
   Fragmented inventory data, weak traceability, manual transaction handling, and access-control needs.

4. **Objectives**  
   Centralization, controlled stock movement, multi-warehouse operation, authorization, and reporting.

5. **Proposed solution**  
   IMS at the center with products, warehouses, stock, invoices, customers, suppliers, users, reports, and audit logs.

6. **Users and functional scope**  
   Roles plus module groups: master data, inventory operations, transactions, governance.

7. **End-to-end inventory flow**  
   Supplier → purchase → approval → receiving → warehouse stock → sale → customer, with branches for returns, transfer, and adjustment.

8. **Transaction lifecycles**  
   Purchase receiving and return/approval states. Use only verified state names.

9. **System architecture**  
   Browser → Next.js → hooks/services → REST API → Spring services → JPA → PostgreSQL, inside Docker deployment.

10. **Frontend architecture**  
    One concrete vertical slice, such as Products page → hook → service → API.

11. **Backend and data integrity**  
    Controller/service/repository layering, transactions, validation, and Flyway migrations.

12. **Database domains**  
    Identity, inventory, transactions, and governance. Keep the full ERD in appendix.

13. **Security model**  
    JWT, BCrypt, URL/method authorization, warehouse scope, and audit trail.

14. **Application UI**  
    Use a screenshot with callouts explaining navigation, KPIs, filters, table status, and operational warnings.

15. **Auditability and reporting**  
    Audit log screenshot plus dashboard/reporting evidence.

16. **Live demo plan**  
    Login → stock baseline → purchase receive → stock increase → sale → stock decrease → movement/audit evidence.

17. **Testing and verification**  
    Unit/integration/security/smoke tests and production builds. Show only actual evidence.

18. **Challenges and engineering decisions**  
    Stock consistency, lifecycle modeling, warehouse scoping, schema evolution, UI synchronization, and traceability.

19. **Limitations and future work**  
    Separate current limitations from proposed enhancements.

20. **Conclusion and questions**  
    Three outcomes, then a clean question slide.

## Appendix

- Full ERD.
- Role/permission matrix.
- Endpoint groups.
- Migration history.
- Detailed purchase lifecycle.
- Detailed return lifecycle.
- Docker deployment diagram.
- Test evidence.
- Folder architecture.
- Extra screenshots.
- Known limitations and unresolved risks.

## Demo discipline

The deck should lead directly into a deterministic demo. Do not navigate randomly. Prepare the data and user account before the defense, and keep screenshots as fallback evidence.
