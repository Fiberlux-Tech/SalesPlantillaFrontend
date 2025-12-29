# CONTEXT_AI.md - Sales Transaction Management System

> **AI Assistant Guide:** This document provides comprehensive context for AI assistants working with the Sales Transaction Management System. It defines the business logic, technical architecture, and interaction patterns to ensure accurate and helpful assistance.

---

## 1. Project Purpose & Core Workflow

### The "North Star"
A financial evaluation tool for sales transactions that enables sales representatives to submit quotes, finance teams to approve them based on profitability metrics (VAN, TIR, payback), and management to track KPIs across different business units (ESTADO, GIGALAN, CORPORATIVO).

### The Primary Flow
1. **Excel Upload** → Sales rep uploads transaction template (PLANTILLA sheet) containing customer info, MRC/NRC, and service details
2. **Data Parsing** → Backend extracts transaction header, recurring services, and fixed costs; locks in master variables (exchange rate, capital cost, bond rate)
3. **Financial Calculation** → System calculates VAN, TIR, payback period, gross margin, and business unit-specific commissions using numpy financial libraries
4. **Database Storage** → Transaction stored in PostgreSQL with PENDING status; child tables (FixedCost, RecurringService) linked via foreign keys
5. **Approval Workflow** → Finance team reviews metrics; approves or rejects transaction; approved transactions are frozen with cached financial metrics
6. **KPI Dashboard** → Aggregated metrics (pending MRC, average margin, pending commissions) displayed with role-based filtering (SALES sees own, FINANCE/ADMIN sees all)

### Key Actors

| Role | Permissions | Typical Actions |
|------|-------------|-----------------|
| **SALES** | Create transactions, view/edit own PENDING transactions, view own KPIs | Upload Excel, monitor pending submissions, respond to rejections |
| **FINANCE** | View/edit all PENDING transactions, approve/reject, manage master variables, view all KPIs | Review profitability, adjust commission calculations, set exchange rates |
| **ADMIN** | Full access + user management | Manage users, reset passwords, change roles |

**Authentication:** Session-based (Flask sessions), role stored in User model
**RBAC Decorators:** `@admin_required`, `@finance_admin_required` (in [utils.py](../PlantillaAPI/app/utils.py))

---

## 2. The Logic "Engine" (Single Source of Truth)

### The Main Calculator
**File:** [PlantillaAPI/app/services/transactions.py:85-300](../PlantillaAPI/app/services/transactions.py#L85-L300)

**Function:** `_calculate_financial_metrics(data)`

**What it does:**
1. **Currency normalization** → Converts all values to PEN using `tipoCambio` (locked at transaction creation)
2. **MRC/NRC calculation** → Sums recurring service prices or uses user-provided override
3. **Carta Fianza (bond) cost** → `0.10 × plazoContrato × MRC_original × 1.18 × tasaCartaFianza` (if applicable)
4. **Revenue calculation** → `NRC_pen + (MRC_pen × plazoContrato)`
5. **Expense calculation** → Fixed costs + (monthly recurring costs × plazo) + commission + bond cost
6. **Gross margin** → `totalRevenue - (fixedCosts + monthlyExpenses)` **before commission**
7. **Commission calculation** → Routes to business unit-specific rules (ESTADO/GIGALAN/CORPORATIVO)
8. **Timeline generation** → Period-by-period cash flow array distributing costs across contract term
9. **NPV/IRR calculation** → `npv(costoCapitalAnual/12, net_cash_flow)` and `irr(net_cash_flow)` using numpy_financial
10. **Payback calculation** → Months until cumulative cash flow becomes non-negative

**Dependencies:**
- [commission_rules.py](../PlantillaAPI/app/services/commission_rules.py) → Business unit commission logic
- numpy_financial → IRR/NPV calculation library
- Master variables → `tipoCambio`, `costoCapitalAnual`, `tasaCartaFianza` (locked in at creation)

### Business Invariants

**CRITICAL RULES - NEVER BREAK THESE:**

1. **All internal calculations are performed in PEN**
   - External systems may provide USD, but calculations use PEN
   - Conversion happens at model layer using locked exchange rate
   - Hybrid properties (e.g., `ingreso_pen`, `egreso_pen`) compute in PEN

2. **Commission calculations follow business unit rules**
   - **ESTADO:** Margin-based tiers with payback limits; different rates for pago único (≤1 month) vs recurrent (12/24/36/48 months)
   - **GIGALAN:** Region-based (LIMA/PROVINCIAS), customer type (NEW/EXISTENTE), payback disqualification if ≥2 months
   - **CORPORATIVO:** Currently returns 0 (not implemented)
   - Source of truth: [commission_rules.py:4-184](../PlantillaAPI/app/services/commission_rules.py#L4-L184)

3. **Approved/Rejected transactions are immutable (frozen)**
   - Cannot edit content once status changes from PENDING
   - Financial metrics cached in `financial_cache` JSON field
   - Recalculation blocked (403 error) if not PENDING
   - Rationale: Prevents retrospective changes affecting approved deals

4. **Master variables are locked at transaction creation**
   - Exchange rate, capital cost, and bond rate "frozen" when transaction created
   - Later changes to master variables DO NOT affect existing transactions
   - Ensures reproducibility of financial metrics over time

5. **User salesman field is server-overridden**
   - Frontend cannot spoof identity
   - Always set to `current_user.username` from session
   - Enforced in [transactions.py:985](../PlantillaAPI/app/services/transactions.py#L985)

6. **Transaction must have child records to be valid for calculation**
   - RecurringServices provide MRC (revenue stream)
   - FixedCosts provide installation/setup costs
   - Empty child tables result in zero MRC/NRC calculations

7. **Security: Fail-fast on missing configuration**
   - `Config.validate_config()` checks for DATABASE_URL, DATAWAREHOUSE_URL, SECRET_KEY
   - Application refuses to start if critical variables missing
   - No silent defaults for security-critical settings

---

## 3. Data Architecture Concepts

### The Transaction Hierarchy

```
Transaction (Parent)
├── ID: FLX{YY}-{MMDDHHMMSSFFFFFF} (server-generated, unique)
├── Status: PENDING → APPROVED/REJECTED (one-way transition)
├── Locked Variables: tipoCambio, costoCapitalAnual, tasaCartaFianza
├── Financial Cache: Frozen metrics (populated on approval/rejection)
│
├── FixedCosts (Children) [One-to-Many, cascade delete]
│   ├── One-time installation/setup costs
│   ├── Can be distributed across months (periodo_inicio, duracion_meses)
│   ├── Currency: Typically USD, normalized to PEN
│   └── Example: Server equipment $5,000 USD over 3 months
│
└── RecurringServices (Children) [One-to-Many, cascade delete]
    ├── Monthly/recurring revenue and cost items
    ├── Revenue: Q × P_pen (quantity × unit price)
    ├── Cost: Q × (CU1_pen + CU2_pen) (two cost components)
    ├── Currency: P typically PEN, CU typically USD
    └── Example: Internet 10 units @ 500 PEN/month, costs 100+50 USD/unit
```

**Critical Relationship:**
- Transaction cannot be deleted without deleting children (cascade)
- Children cannot exist without parent (foreign key constraint)
- Transaction ID is `String` type (not auto-increment Integer) due to custom format

**Models:** [PlantillaAPI/app/models.py](../PlantillaAPI/app/models.py)
- Transaction: Lines 45-150
- FixedCost: Lines 153-196
- RecurringService: Lines 199-258

### Naming Conventions (Excel → Database Mapping)

**Excel PLANTILLA Sheet → Transaction Fields**

| Excel Cell/Column | Database Field | Notes |
|-------------------|----------------|-------|
| C2 | `clientName` | Customer name |
| C3 | `companyID` | Company RUC/ID |
| C1 | `salesman`, `orderID` | Sales rep and quote ID (same cell) |
| C13 | `plazoContrato` | Contract term (months) |
| C10 | `MRC` | Monthly recurring cost (may be override) |
| C11 | `NRC` | Non-recurring cost |
| H16 | `comisiones` | **IGNORED** - calculated server-side |

**Recurring Services (Row 29+)**

| Excel Column | Database Field | Type |
|--------------|----------------|------|
| J | `tipo_servicio` | Service type (product name) |
| K | `nota` | Notes/description |
| L | `ubicacion` | Location/destination |
| M | `Q` | Quantity |
| N | `P` → `P_original` | Unit price (revenue) |
| P | `CU1` → `CU1_original` | First cost component |
| Q | `CU2` → `CU2_original` | Second cost component |
| R | `proveedor` | Service provider |

**Fixed Costs (Row 29+)**

| Excel Column | Database Field |
|--------------|----------------|
| A | `categoria` | Category (e.g., "Inversión") |
| B | `tipo_servicio` | Service type |
| C | `ticket` | Investment code/ticket ID |
| D | `ubicacion` | Location |
| E | `cantidad` | Quantity |
| F | `costoUnitario` → `costoUnitario_original` | Unit cost |

**Important:** Excel uses "MRC" but model has `MRC_original`, `MRC_currency`, `MRC_pen` (three-field pattern for currency handling)

**Configuration:** [PlantillaAPI/app/config.py:40-68](../PlantillaAPI/app/config.py#L40-L68)

### State Machine (Transaction Lifecycle)

```
[CREATION]
    ↓
    | - POST /api/submit-transaction (save_transaction)
    | - Sets status = PENDING
    | - Locks master variables
    | - Sends submission email
    ↓
[PENDING] ← Editable state
    ↓
    | - PUT /api/transaction/{id} (update_transaction_content)
    | - Can modify: Fixed costs, recurring services, header data
    | - Recalculates metrics live (no cache)
    | - Access: SALES (own only), FINANCE/ADMIN (any)
    ↓
[APPROVAL DECISION]
    ↓
    ├─→ [APPROVED]
    |      | - POST /api/transaction/approve/{id}
    |      | - Stores financial_cache (frozen metrics)
    |      | - Sets approvalDate
    |      | - Sends approval email
    |      | - **IMMUTABLE** (cannot edit)
    |
    └─→ [REJECTED]
           | - POST /api/transaction/reject/{id}
           | - Stores rejection_note
           | - Stores financial_cache
           | - Sends rejection email
           | - **IMMUTABLE** (cannot edit)
```

**Status Field:** `ApprovalStatus` (String: "PENDING", "APPROVED", "REJECTED")

**Immutability Enforcement:**
- Edit attempt on APPROVED/REJECTED → 403 Forbidden
- Recalculate commission on APPROVED/REJECTED → 403 Forbidden
- View always works (uses cache for APPROVED/REJECTED, live calculation for PENDING)

---

## 4. Technical Guardrails

### Security Standards

**CRITICAL: Fail-Fast Configuration**
```python
# PlantillaAPI/app/config.py:131-222
Config.validate_config()
```
- **NEVER** suggest hardcoding credentials in code
- **ALWAYS** use environment variables (.env file)
- Application refuses to start if `DATABASE_URL`, `DATAWAREHOUSE_URL`, or `SECRET_KEY` missing
- SECRET_KEY must be ≥32 characters for session security

**Authentication & Session Management**
- Flask sessions (server-side)
- bcrypt password hashing (`User.set_password()`, `User.check_password()`)
- Role-based access control (RBAC) via decorators
- **NEVER** disable RBAC checks in production code

**SQL Injection Prevention**
- **ALWAYS** use SQLAlchemy ORM (parameterized queries)
- **NEVER** use raw SQL with f-strings or string concatenation
- External database queries use psycopg2 with parameterized queries

**CORS Configuration**
- Allowed origins from `CORS_ALLOWED_ORIGINS` environment variable
- **NEVER** set CORS to `*` in production

### Error Handling Philosophy

**System Errors → app.logger**
```python
import logging
app.logger.error(f"Failed to calculate metrics: {str(e)}")
```
- Use for unexpected exceptions, database errors, external API failures
- Logs go to console (development) or log aggregator (production)

**Business Logic Errors → Structured JSON**
```python
return {
    "success": False,
    "error": "Transaction must be PENDING to recalculate commission"
}, 403
```
- Use for validation errors, permission errors, not-found errors
- Frontend displays error message to user
- Include HTTP status code in tuple return

**Helper Function:**
```python
# utils.py:13-29
def _handle_service_result(result, default_error_status=500):
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    else:
        return jsonify(result), 200
```

**Validation Pattern:**
```python
if transaction.ApprovalStatus != 'PENDING':
    return {"success": False, "error": "Cannot edit approved transaction"}, 403
```

### Update Patterns

**PREFER: Delete and Recreate for Complex Nested Data**

**Example:** Updating fixed costs in transaction
```python
# PlantillaAPI/app/services/transactions.py:1097-1103

# 1. Delete all existing children
for fc in transaction.fixed_costs:
    db.session.delete(fc)

# 2. Create fresh children from new data
for fc_data in updated_data['fixedCosts']:
    new_fc = FixedCost(**fc_data, transaction_id=transaction.id)
    db.session.add(new_fc)
```

**Rationale:**
- Avoids complex PATCH logic (insert/update/delete detection)
- Prevents orphaned records
- Simpler error handling
- Clearer audit trail

**When to use PATCH instead:**
- Single-field updates (e.g., changing transaction status)
- Performance-critical updates with many children
- When preserving child record IDs is important

**Example:** Simple field update
```python
transaction.ApprovalStatus = 'APPROVED'
transaction.approvalDate = datetime.utcnow()
db.session.commit()
```

---

## 5. AI Interaction Rules (The "How to Help Me" Section)

### Communication Style

**RULE 1: Conceptual Discussion Before Code**

**DO THIS:**
```
User: "I want to add a new commission rule for CORPORATIVO"

AI: "Before implementing, let's clarify the business logic:

1. Should CORPORATIVO follow a similar margin-based structure to ESTADO?
2. Are there payback period requirements like GIGALAN?
3. What are the commission rates and brackets?

Once we define the rules, I'll implement them in commission_rules.py
following the same pattern as _calculate_estado_commission."
```

**DON'T DO THIS:**
```
AI: "Here's the code for CORPORATIVO commission:
[immediately dumps 100 lines of code without discussion]
```

**Rationale:** Business logic errors are more costly than syntax errors. Ensure understanding before coding.

### Code Review Priorities

**PRIORITY ORDER (High to Low):**

1. **Financial Accuracy**
   - Are commission brackets correct?
   - Is currency normalization applied consistently?
   - Are NPV/IRR calculations using correct discount rate?
   - Is the timeline generation distributing costs correctly?

2. **Currency Normalization**
   - All calculations in PEN?
   - USD→PEN conversion using locked `tipoCambio`?
   - Hybrid properties returning `_pen` fields?

3. **Business Rule Compliance**
   - Immutability of approved transactions enforced?
   - Master variables locked at creation?
   - RBAC checks in place?
   - Payback limits respected for commissions?

4. **Data Integrity**
   - Cascade deletes configured on relationships?
   - Foreign key constraints enforced?
   - Server-side salesman override active?

5. **Syntax & Style**
   - PEP 8 compliance
   - Proper error handling
   - Consistent naming

**When Reviewing Code:** Always check financial logic FIRST. A working but financially incorrect system is worse than a syntax error.

### Next-Step Proactivity

**After solving a problem, ALWAYS suggest a logical next step:**

**Example 1:** After fixing a bug
```
AI: "Fixed the currency conversion bug in FixedCost.total_pen.

Next steps to consider:
1. Run the test suite to ensure no regressions: `pytest tests/`
2. Test with a sample transaction to verify correct PEN totals
3. Check if RecurringService has the same issue (similar code pattern)

Would you like me to proceed with any of these?"
```

**Example 2:** After implementing a feature
```
AI: "Implemented the CORPORATIVO commission rules in commission_rules.py.

Next steps:
1. Add unit tests for the new commission calculator
2. Update the API documentation to reflect CORPORATIVO support
3. Create a migration if new database fields are needed
4. Test with sample CORPORATIVO transactions

Should I start with the unit tests?"
```

**Pattern:** State what was done → Suggest 2-4 actionable next steps → Ask which to pursue

### Clarification Questions

**ALWAYS ask when:**
- Business logic is ambiguous (e.g., "improve performance" → which KPIs?)
- Multiple valid technical approaches exist (e.g., caching strategy)
- User intent is unclear (e.g., "fix the margin calculation" → which margin?)
- Breaking changes are required (e.g., changing API response format)

**NEVER assume:**
- Commission rates or financial formulas (ask for confirmation)
- Currency handling rules (verify PEN/USD expectations)
- User permissions or role requirements (clarify access control)

### Code Change Scope

**Minimize Scope:**
- If asked to "fix commission calculation," ONLY change commission code
- Don't refactor surrounding code unless specifically requested
- Don't add extra features "for future use"
- Don't change variable names unless part of the task

**Explain Trade-offs:**
```
AI: "I can implement this two ways:

Approach 1: Quick fix (modify existing function)
+ Faster to implement
+ Minimal risk of breaking other features
- Code becomes slightly less maintainable

Approach 2: Refactor into separate module
+ Cleaner architecture
+ Easier to test
- Requires changing imports in 5 other files
- Higher risk of regression

Which approach do you prefer?"
```

---

## 6. Common Debugging Patterns

### Currency Mismatch Issues

**Symptom:** Financial metrics don't match expectations

**Check:**
1. Is `tipoCambio` locked in the transaction?
2. Are `_original`, `_currency`, `_pen` fields all populated?
3. Is `_normalize_to_pen()` being called for USD values?
4. Are hybrid properties (e.g., `ingreso_pen`) computing correctly?

**Debug Command:**
```python
# In Flask shell
t = Transaction.query.get('FLX25-250101120000000001')
print(f"MRC_original: {t.MRC_original} {t.MRC_currency}")
print(f"MRC_pen: {t.MRC_pen}")
print(f"Exchange rate: {t.tipoCambio}")
print(f"Expected: {t.MRC_original * t.tipoCambio if t.MRC_currency == 'USD' else t.MRC_original}")
```

### Commission Calculation Issues

**Symptom:** Commission is 0 or unexpected amount

**Check:**
1. What is `unidadNegocio`? (ESTADO/GIGALAN/CORPORATIVO)
2. Is `grossMarginRatio` calculated correctly? (check that commission isn't included in margin)
3. For ESTADO: Does `plazoContrato` match a defined bracket? (12/24/36/48)
4. For ESTADO: Is `payback` within the limit for the margin bracket?
5. For GIGALAN: Is `payback < 2`? (disqualification rule)
6. For GIGALAN: Are `gigalan_region` and `gigalan_sale_type` set correctly?

**Debug Command:**
```python
from app.services.commission_rules import _calculate_final_commission

data = {
    'unidadNegocio': 'ESTADO',
    'totalRevenue': 100000,
    'MRC_pen': 5000,
    'plazoContrato': 12,
    'payback': 6.5,
    'grossMarginRatio': 0.42
}
result = _calculate_final_commission(data)
print(f"Commission: {result}")
```

### Immutability Errors (403 Forbidden)

**Symptom:** Cannot edit transaction

**Check:**
1. What is `transaction.ApprovalStatus`? (must be PENDING)
2. Is the user trying to edit their own transaction (SALES) or any transaction (FINANCE/ADMIN)?
3. Is the frontend sending the correct HTTP method (PUT vs POST)?

**Solution:** If transaction needs to be re-opened, manually change status in database or add "Re-open" feature

### Missing Master Variables

**Symptom:** Transaction creation fails with "Master variable not found"

**Check:**
1. Are `tipoCambio`, `costoCapitalAnual`, `tasaCartaFianza` set in database?
2. Query: `SELECT * FROM master_variable WHERE variable_name IN ('tipoCambio', 'costoCapitalAnual', 'tasaCartaFianza') ORDER BY date_recorded DESC`

**Solution:**
```bash
# Set via API
curl -X POST http://localhost:5000/api/master-variables/update \
  -H "Content-Type: application/json" \
  -d '{"name": "tipoCambio", "value": 3.75, "comment": "Initial setup"}'
```

---

## 7. Project-Specific Context

### Pending TODO Items (from README.md)

**Current known issues to be addressed:**
1. Fix transaction detail modal (live editing, currency conversion, real-time KPI updates)
2. Carta Fianza multi-year handling (currently only calculates one year)
3. Separate "Otros" line into "Carta Fianza" and "Comisiones"
4. Add download option for finance team
5. Add commission month flag
6. Fix fixed cost table editing (currently modifies all rows)
7. KPIs should use present value (discuss with Franco)
8. Add filters in finance view (Business Unit, date, salesman) with KPI updates

### External Dependencies

**Data Warehouse Tables:**
- `dim_ticket_interno_producto_bi` → Fixed cost lookups (investment codes)
- `dim_cotizacion_bi` → Recurring service lookups (quote services)
- `dim_cliente_bi` → Customer master data (RUC, razon social)

**External API:** None (direct database queries via psycopg2)

**Future Integration:** Feasibility table connection (TODO item #9)

### Frontend Repository

**Location:** `/home/administrator/SalesPlantillaFrontend/`

**Tech Stack:** React (assumed based on frontend repository structure)

**Key Interactions:**
- Excel upload via `POST /api/process-excel`
- Transaction submission via `POST /api/submit-transaction`
- KPI dashboard queries via `GET /api/kpi/*`
- Transaction detail modal via `GET /api/transaction/{id}`

---

## 8. Quick Reference

### Key Files Cheat Sheet

| What | Where |
|------|-------|
| Financial calculations | [PlantillaAPI/app/services/transactions.py:85-300](../PlantillaAPI/app/services/transactions.py#L85-L300) |
| Commission rules | [PlantillaAPI/app/services/commission_rules.py](../PlantillaAPI/app/services/commission_rules.py) |
| Database models | [PlantillaAPI/app/models.py](../PlantillaAPI/app/models.py) |
| Excel mapping | [PlantillaAPI/app/config.py:40-68](../PlantillaAPI/app/config.py#L40-L68) |
| Excel parser | [PlantillaAPI/app/services/excel_parser.py](../PlantillaAPI/app/services/excel_parser.py) |
| RBAC decorators | [PlantillaAPI/app/utils.py](../PlantillaAPI/app/utils.py) |
| Master variables | [PlantillaAPI/app/services/variables.py](../PlantillaAPI/app/services/variables.py) |
| KPI calculations | [PlantillaAPI/app/services/kpi.py](../PlantillaAPI/app/services/kpi.py) |

### Most Common Commands

```bash
# Start backend
cd /home/administrator/PlantillaAPI
source venv/bin/activate
flask run

# Run migrations
flask db migrate -m "description"
flask db upgrade

# Flask shell (debugging)
flask shell
>>> from app.models import Transaction
>>> t = Transaction.query.first()

# Set master variable
curl -X POST http://localhost:5000/api/master-variables/update \
  -H "Content-Type: application/json" \
  -d '{"name": "tipoCambio", "value": 3.75, "comment": "Daily rate"}'
```

### Environment Variables Checklist

```bash
# Critical (must be set)
DATABASE_URL=postgresql://user:pass@host:port/dbname
DATAWAREHOUSE_URL=postgresql://user:pass@host:port/dwname
SECRET_KEY=your-secret-key-at-least-32-characters

# Email (optional but recommended)
MAIL_SERVER=smtp.office365.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=sender@example.com
MAIL_PASSWORD=password
MAIL_DEFAULT_RECIPIENT=notifications@example.com

# CORS (production)
CORS_ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com
```

---

## 9. Glossary

| Term | Meaning |
|------|---------|
| **VAN** | Valor Actual Neto (Net Present Value) - NPV in English |
| **TIR** | Tasa Interna de Retorno (Internal Rate of Return) - IRR in English |
| **MRC** | Monthly Recurring Cost (monthly revenue from services) |
| **NRC** | Non-Recurring Cost (one-time installation/setup revenue) |
| **Carta Fianza** | Letter of Credit / Performance Bond (cost of bond for contract) |
| **Plazo Contrato** | Contract term in months (12, 24, 36, 48, 60+) |
| **Payback** | Payback period in months (time to recover investment) |
| **Tipo Cambio** | Exchange rate (USD to PEN conversion) |
| **Costo Capital Anual** | Annual cost of capital / discount rate (for NPV calculation) |
| **Tasa Carta Fianza** | Bond rate percentage (cost of carta fianza) |
| **Unidad Negocio** | Business unit (ESTADO, GIGALAN, CORPORATIVO) |
| **Gross Margin** | Revenue minus costs (before commission) |
| **Pago Unico** | Single payment (contract ≤ 1 month in ESTADO) |
| **EXISTENTE** | Existing customer (GIGALAN commission category) |
| **NUEVO** | New customer (GIGALAN commission category) |

---

**Document Version:** 1.0
**Last Updated:** 2025-12-29
**Maintained By:** Sales Transaction Management Team

*This document should be updated whenever significant business logic, architectural decisions, or technical patterns change.*
