create role shop_db_user login password 'SHOP_DB_USER_PASSWORD_PLACEHOLDER';

-- schema access
grant usage on schema public to shop_db_user;


-- products - read-only
grant select
on table public.products
to shop_db_user;


-- users - registration, profile viewing and updating
grant select, insert, update
on table public.users
to shop_db_user;


-- addresses - customer address management
grant select, insert, update, delete
on table public.addresses
to shop_db_user;


-- orders - create, view and update
grant select, insert, update
on table public.orders
to shop_db_user;


-- order_items - create, view and update
grant select, insert, update
on table public.order_items
to shop_db_user;


-- payments - create and view
grant select, insert
on table public.payments
to shop_db_user;

-- sequence access for auto-generated IDs
grant usage, select on all sequences in schema public to shop_db_user;