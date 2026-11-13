---
shaping: true
---

# Invite CDPS permissions — Frame

## Source

> 1. Summary:
> Enhance the existing BXP/OBA User Management experience to support permit-specific permission assignment for CDPS permits during user onboarding.
> When an Admin or Secondary Admin invites a user to an organization, they shall be able to assign access to organization-based CDPS permit applications through a new Other Permits category, including the ability to grant Create New Permit Application access, assign access to All Applications or Selected Applications, and define application-specific View/Edit permissions.
>
> 2. User Story:
> As an Admin or Secondary Admin,
> I want to assign permit-specific permissions when inviting organization users,
> so that users only receive access to the permits and actions required to perform their responsibilities on behalf of the organization.
>
> 3. Requirements
> Pre-Conditions
> User has successfully authenticated.
> User belongs to an organization profile.
> User has Admin or Secondary Admin privileges.
> Organization has access to one or more CDPS permits.
> User Management functionality is available.
> Functional Flow
> Invite User and Assign Permit Permissions
> Admin or Secondary Admin selects Add User.
> Admin or Secondary Admin enters the user's email address.
> Admin or Secondary Admin selects a role:
> Secondary Admin
> Representative (Delegate)
> Member
> System displays permission assignment options grouped into:
> Mining Projects
> Other Permits
> If Mining Projects access is selected:
> Existing Mining Project permission assignment flow shall remain unchanged.
> If Other Permit is selected:
> System displays Create New Permit Application permission options:
> Access to All Applications
> Access to Selected Applications
> System displays only organization-based applications that support RBAC shall be displayed within the Other Permits category. Individual-facing applications shall not be displayed.
> System displays UI guidance/Message indicating that Mining Project permissions are managed through the Mining Projects section and are assigned at the project level.
> If no eligible permits are available, the system shall display an informational message and/or call-to-action.
> Admin or Secondary Admin selects the permits the user can access.
> Admin or Secondary Admin assigns available permissions for each permit.
> User invitation is submitted.
> Invited user receives access according to the assigned role and permissions.
>
> 4. Source / Background:
> CDPS is onboarding organization-based permits that will leverage the existing BXP/OBA Role-Based Access Control (RBAC) model.
> Currently, organization administrators can invite users and assign permissions for Mining Projects.
> This enhancement extends the User Management experience to support assignment of permissions for organization-based CDPS permit applications through a new Other Permits category while preserving the existing Mining Project permission assignment model. Mining Project permissions continue to be assigned and managed through the existing project-based permission model.
>
> 5. Design Reference:
> [Add Figma link or screenshot]
>
> 6. Business Rules / Notes:
> The existing Mining Project permission assignment flow shall remain unchanged.
> Admins and Secondary Admins shall be able to assign CDPS permit permissions when inviting organization users.
> Permit permissions shall be configurable separately from Mining Project permissions.
> Admins and Secondary Admins shall be able to assign either:
> Access to All Applications or
> Access to Selected Applications
> Assigned users shall only be able to view and access applications explicitly assigned to them.
> The enhancement applies only to organization-based permits. Individual applicant journeys are out of scope.
> Existing RBAC roles shall continue to apply:
> Admin
> Secondary Admin
> Representative (Delegate)
> Member
> For CDPS permits, the following permissions shall be available for assignment:
> View
> Edit
> The permission assignment experience shall display two permission categories:
> Mining Projects
> Other Permits
> Only permits applicable to the organization's applicant type shall be displayed within the Other Permits category.
> If no eligible permits are available for assignment, the system shall display an informational message and/or call-to-action.
> Permissions shall be assigned at the application level. The Other Permits section shall display application names rather than individual permit names.
> Mining Project permissions shall continue to be assigned through the Mining Projects permission model and shall not be configured through the Other Permits section.

> Permit categories and permit name table:
>
> | PERMIT_TYPENAME | PERMIT_SHORT_NAME |
> | --- | --- |
> | MOS | Professional Combative Sport Event Permit |
> | MOS | Amateur Combative Sport Event Permit |
> | SO | OBR Form 7 |
> | MECP | MECP Wells Contractor Licence |
> | SOLGEN | Security Guard / Private Investigator Agency Licence |
> | MOF | Tobacco Retailer Dealer's Permit |
> | MOF | Certificate of Exemption – First Nations Band Empowered Vehicles |
> | MOF | International Fuel Tax Agreement Licence |
> | MOF | Tobacco Tax Collector Designation |
> | MOF | Cigar Tax Collector Designation |
> | MOF | Manufacturer Registration Certificate |
> | MOF | Importer Registration Certificate |
> | MOF | Exporter Registration Certificate |
> | MOF | Permit to Purchase and Sell Unmarked Cigarettes |
> | MOF | Permit to Purchase and Sell Unmarked Fine Cut Tobacco |
> | MOF | Permit to Mark Cigarettes |
> | MOF | Permit to Mark Fine Cut Tobacco |
> | MOF | Interjurisdictional Transporter Registration Certificate (Tobacco Tax) |
> | MOF | Wholesaler's Permit |
> | MOF | Transit Permit |
> | MOF | Vendor Permit (Retail Sales Tax) |
> | MOF | Register Raw Leaf Tobacco |
> | MOF | Designation as a Collector of (Fuel Tax) |
> | MOF | Designation as a Collector of (Gasoline Tax) |
> | MOF | Manufacturer Registration Certificate – Fuel |
> | MOF | Manufacturer Registration Certificate – Gasoline |
> | MOF | Dyer Registration Certificate (Fuel only) |
> | MOF | Importer Registration Certificate (Fuel Tax) |
> | MOF | Exporter Registration Certificate (Fuel Tax) |
> | MOF | Importer Registration Certificate (Gasoline Tax) |
> | MOF | Exporter Registration Certificate (Gasoline Tax) |
> | MOF | Interjurisdictional Transporter Registration Certificate (Fuel Tax) |
> | MOF | Interjurisdictional Transporter Registration Certificate (Gasoline Tax) |
> | MOF | Fuel Acquisition Permit |
> | MOF | Railway Company Registration Certificate (Fuel Tax) |
> | MPBSDP | Co-operative Corporations Act - Articles of Revival |
> | MPBSDP | Co-operative Corporations Act - Articles of Continuance as a Co-operative with Share Capital |
> | MPBSDP | Co-operative Corporations Act - Articles of Continuance as a Co-operative without Share Capital |
> | MPBSDP | Co-operative Corporations Act - Articles of Amendment (converting to a Not-for-Profit Corporations Act, 2010 Corporation) |
> | MPBSDP | Co-operative Corporations Act - Articles of Amendment (converting to a Business Corporations Act Corporation) |
> | MPBSDP | Co-operative Corporations Act – Articles of Amendment |
> | MPBSDP | Co-operative Corporations Act - Articles of Incorporation of a Co-operative without Share Capital (if Not-for-Profit organization) |
> | MPBSDP | Co-operative Corporations Act - Articles of Amalgamation |
> | MPBSDP | Co-operative Corporations Act - Articles of Incorporation of a Co-operative with Share Capital |
> | MPBSDP | Co-operative Corporations Act - Articles of Incorporation of a Co-operative without Share Capital |
> | MPBSDP | Corporations Act - Revival of Letters Patent |
> | MPBSDP | Corporations Act - Supplementary Letters Patent |
> | MPBSDP | Corporations Act - Letters Patent of Amalgamation |
> | MPBSDP | Corporations Act - Letters Patent |
> | MPBSDP | Corporations Act — Corrected Letters Patent or Corrected Supplementary Letters Patent |
> | MPBSDP | Limited Partnerships Act – Corrected Declaration of a Limited Partnership |
> | MPBSDP | Payday Broker |
> | MPBSDP | Personal Information Investigator |
> | MPBSDP | Payday lender |
> | MPBSDP | Consumer Reporting Agency |
> | MPBSDP | Collection Agency |
> | MPBSDP | Bailiff business – appointed |
> | MPBSDP | Assistant Bailiff – registered |
> | MPBSDP | Bailiff – appointed |

> Scenario A: Tom would like to give Ravi access to create to all permits in MPBSDP, plus two permit only in MOF
>
> Scenario B: Tom would like to give Ravi access to draft applications in the profile or submitted in the profile.
>
> Scenario C: For initiate/create an application - A user should be able to browse by ministry and then should be able to search for a specific permit or by Individual permit
>
> Scenario D: For existing application, A user should be able to browse by individual application name/ number or by ministry and then should be able to search for a specific application.
>
> note an application is basically a permit that is in draft or submitted. A the permit categories are the ministries basically as wel

> Clarifications (session):
> - Invite + runtime — invite assignment and post-login create/existing-app browse/search
> - All vs Selected is **per ministry** (e.g. All in MPBSDP, Selected in MOF) — Scenario A
> - Mining Projects are different from Permit Applications; user may grant permissions in each entity independently; mining may be irrelevant when granting permit application permissions
> - Need progressive disclosure so users can assign permit-only, mining-only, or both without overwhelming choices
>
> Whiteboard model (session sketch):
> Business Role → Permissions → Mining Projects | Permit Applications → Create New | View existing | Edit existing → Create: All permits | Selected permits (ministry); View/Edit: Selected existing applications (instances)

---

## Problem

Organization admins can invite users and assign **Mining Projects** permissions today, but cannot assign **organization-based CDPS permit application** permissions in the same User Management invite flow. Mining and permit applications are different domains; forcing both assignment trees on every invite overwhelms inviters who only need one. Without separate Create / View / Edit scopes (including per-ministry All vs Selected and existing application instances), invited users either get too much access or cannot do their job. Runtime create and existing-application browse also need to honor those scopes.

---

## Outcome

An Admin or Secondary Admin can invite a user, choose **Mining Projects** and/or **Permit Applications** (or neither beyond role defaults), and assign only the Create / View / Edit scopes required. Mining assignment stays on the existing project model. Permit Applications support per-ministry All vs Selected for create, and selected existing applications for view/edit. Invited users then only see create and existing-application browse/search surfaces allowed by those scopes. Individual-facing permits remain out of scope.
