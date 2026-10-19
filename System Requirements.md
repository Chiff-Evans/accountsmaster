POS 
Business Configurations
CRUD - business_name, owner_name email, phone, location

Menus management Configurations
CRUD - menu_name, parent_menu_id, level, view, order, icon, description,is_visible
parent_menu_id - self reference to the menu table, null for top level menu

Roles/Groups Management Configurations
CRUD - Role - role_name, description, access rights(menus that can be accessed, and actions)
CRUD - Role Users

Processes Types Configurations
CRUD - process_type_name, description, data_table
Process Examples - client registration, user registration, order placement, supplier registration etc

Refrence Numbering Configurations
CRUD - process_type, prefix, initial_serial,next_serial, use_year

Users Management
CRUD - User registration - user_ref_no,Name(firstname, lastname),gender, phone,email, profile
Username,password, last login, sessions
Actions on user - lock/suspend, revoke,reset password


Stock Entry
Categories and sub categories
Units of measure configurations
CRUD - unit_name, description

Items catalogue 
CRUD - item_name,category_id,

Stock Entry 
Crud - Item_id, quantity, unit_id

Price management configurations
CRUD - item_id, quantity, unit_id, price_amount, currency


Client Management
CRUD - Client Registration - client_ref_no Name(firstname, lastname), gender, phone,email, profile
CRUD - Shops - shop_name, owner(client_id), geolocation

Supplier Management
CRUD - Suplier Registration - suplier_ref_no, Name, phone,email
CRUD - Supply Items - Item_id

Orders Management
CRUD order- order_ref_no, shop, ordered_by
CRUD - Order items - item_id, quantity, unit_id

Workflow Configurations - 
Order Stages 
	Draft, creating an order.
	Pending Submited, The order has been placed but not yet confirmed,
	Confirmed - the vendor has acknoledged receipt of the order.
	Processing,, - the shop has started preparing the order (packing, picking items, etc.).
	On Hold - The order is paused—usually due to payment verification issues, stock problems, or manual review.
	Shipped / Dispatched - The order has left the store and is with a courier or delivery service.
	Delivered /  - The customer has received the order successfully.
	Completed - Order received and payments done
	Cancelled - The order was cancelled by the customer or the shop before completion.
	Awaiting Payment - Payment not yet made
	Payment Done
	Refunded - Payment has been returned to the customer after cancellation or return.
	Returned - The customer sent the item back after delivery (may lead to a refund or exchange).
Order statuses
	In progress
	Done
	Cancelled
	Rejected

Dashboard reports
Different graphical views for items
