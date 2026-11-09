-- shop_db database would already exist
create extension if not exists pgcrypto;

do $$
begin
    if not exists (
        select 1
        from pg_type
        where typname = 'category_t'
    ) then
        create type category_t as enum (
            'electronics',
            'stationary',
            'clothing'
        );
    end if;

    if not exists (
        select 1
        from pg_type
        where typname = 'order_status_t'
    ) then
        create type order_status_t as enum (
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        );
    end if;
end
$$;


create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text not null,
    price decimal(10,2) not null,
    category category_t not null
);


create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    password_h text not null
);


create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id),
    status order_status_t not null default 'pending',
    created_at timestamptz not null default now()
);


create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    product_id uuid not null references products(id),
    quantity integer not null check (quantity > 0),
    unit_price decimal(10,2) not null 
);

create table if not exists addresses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    full_name text not null,
    phone text not null,
    address_line text not null,
    city text not null,
    state text not null,
    postal_code text not null,
    country text not null,
    is_default boolean not null default false
);

create table if not exists payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id),
    amount decimal(10,2) not null,
    status text not null default 'pending',
    payment_method text not null,
    transaction_id text unique,
    created_at timestamptz not null default now()
);