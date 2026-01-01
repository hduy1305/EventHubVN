create table ticket_store_db.orders
(
    id             bigint auto_increment
        primary key,
    created_at     datetime(6)                                       null,
    currency       varchar(255)                                      null,
    discount_code  varchar(255)                                      null,
    event_id       bigint                                            null,
    payment_method varchar(255)                                      null,
    status         enum ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED') null,
    total_amount   decimal(38, 2)                                    null,
    updated_at     datetime(6)                                       null,
    user_id        binary(16)                                        null
);

create table ticket_store_db.order_items
(
    id             bigint auto_increment
        primary key,
    price          decimal(38, 2) null,
    ticket_type_id bigint         null,
    order_id       bigint         null,
    constraint FKbioxgbv59vetrxe0ejfubep1w
        foreign key (order_id) references ticket_store_db.orders (id)
);

create table ticket_store_db.payment_info
(
    id             bigint auto_increment
        primary key,
    amount         decimal(38, 2)                        null,
    method         varchar(255)                          null,
    paid_at        datetime(6)                           null,
    status         enum ('PENDING', 'SUCCESS', 'FAILED') null,
    transaction_id varchar(255)                          null,
    order_id       bigint                                null,
    constraint UK_23m0vw9ubxx75bkv6ohvbuu9w
        unique (order_id),
    constraint FKlvi5j82l41gxfinwo8npi37qc
        foreign key (order_id) references ticket_store_db.orders (id)
);

create table ticket_store_db.payment_transactions
(
    id             bigint auto_increment
        primary key,
    amount         decimal(38, 2)                                    null,
    created_at     datetime(6)                                       null,
    order_id       bigint                                            null,
    payment_method varchar(255)                                      null,
    status         enum ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') null,
    transaction_id varchar(255)                                      null,
    updated_at     datetime(6)                                       null,
    vnpay_txn_ref  varchar(255)                                      null
);

create table ticket_store_db.permissions
(
    id          bigint auto_increment
        primary key,
    description varchar(255) null,
    name        varchar(255) not null,
    constraint UKpnvtwliis6p05pn6i3ndjrqt2
        unique (name)
);

create table ticket_store_db.reservations
(
    id             bigint auto_increment
        primary key,
    event_id       bigint                                                null,
    expire_at      datetime(6)                                           null,
    quantity       int                                                   null,
    seat_id        bigint                                                null,
    status         enum ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED') null,
    ticket_type_id bigint                                                null,
    user_id        binary(16)                                            null
);

create table ticket_store_db.roles
(
    id          bigint auto_increment
        primary key,
    description varchar(255) null,
    name        varchar(255) not null,
    constraint UKofx66keruapi6vyqpv6f2or37
        unique (name)
);

create table ticket_store_db.role_permissions
(
    role_id       bigint not null,
    permission_id bigint not null,
    primary key (role_id, permission_id),
    constraint FKegdk29eiy7mdtefy5c7eirr6e
        foreign key (permission_id) references ticket_store_db.permissions (id),
    constraint FKn5fotdgk8d1xvo8nav9uv3muc
        foreign key (role_id) references ticket_store_db.roles (id)
);

create table ticket_store_db.tickets
(
    id             bigint auto_increment
        primary key,
    attendee_email varchar(255)                                          null,
    attendee_name  varchar(255)                                          null,
    created_at     datetime(6)                                           null,
    event_id       bigint                                                null,
    order_id       bigint                                                null,
    seat_id        bigint                                                null,
    seat_label     varchar(255)                                          null,
    status         enum ('ISSUED', 'SCANNED', 'REFUNDED', 'TRANSFERRED') null,
    ticket_code    varchar(255)                                          null,
    updated_at     datetime(6)                                           null,
    user_id        varchar(255)                                          null
);

create table ticket_store_db.marketplace_listings
(
    id         binary(16)                           not null
        primary key,
    created_at datetime(6)                          null,
    price      decimal(38, 2)                       null,
    seller_id  varchar(255)                         null,
    status     enum ('ACTIVE', 'SOLD', 'CANCELLED') null,
    updated_at datetime(6)                          null,
    ticket_id  bigint                               null,
    constraint UK_9q5gnq6khmirfxi9cfc9tie47
        unique (ticket_id),
    constraint FKq2gjh9clj7koa588hfauqno17
        foreign key (ticket_id) references ticket_store_db.tickets (id)
);

create table ticket_store_db.ticket_transfers
(
    id              binary(16)                               not null
        primary key,
    created_at      datetime(6)                              null,
    recipient_email varchar(255)                             null,
    sender_id       varchar(255)                             null,
    status          enum ('PENDING', 'APPROVED', 'REJECTED') null,
    updated_at      datetime(6)                              null,
    ticket_id       bigint                                   null,
    constraint UK_jfstiespc6i68p7jo1pnflclk
        unique (ticket_id),
    constraint FKmxr9rhg9q3t6kum3p8nblsgey
        foreign key (ticket_id) references ticket_store_db.tickets (id)
);

create table ticket_store_db.users
(
    id            binary(16)                              not null
        primary key,
    created_at    datetime(6)                             null,
    email         varchar(255)                            not null,
    full_name     varchar(255)                            null,
    password_hash varchar(255)                            not null,
    phone         varchar(255)                            null,
    status        enum ('ACTIVE', 'PENDING', 'SUSPENDED') null,
    updated_at    datetime(6)                             null,
    constraint UK6dotkott2kjsp8vw4d0m25fb7
        unique (email)
);

create table ticket_store_db.organizations
(
    id                        binary(16)                   not null
        primary key,
    cancellation_policy       text                         null,
    contact_email             varchar(255)                 null,
    created_at                datetime(6)                  null,
    description               text                         null,
    fees_and_taxes            varchar(255)                 null,
    name                      varchar(255)                 not null,
    refund_policy             text                         null,
    status                    enum ('ACTIVE', 'SUSPENDED') null,
    supported_payment_methods varchar(255)                 null,
    updated_at                datetime(6)                  null,
    owner_user_id             binary(16)                   null,
    constraint FK37dv86ymr1mh8lhcosssu5rc6
        foreign key (owner_user_id) references ticket_store_db.users (id)
);

create table ticket_store_db.user_organization_roles
(
    id              bigint auto_increment
        primary key,
    organization_id binary(16) not null,
    role_id         bigint     not null,
    user_id         binary(16) not null,
    constraint FK1wsh1dm281tb63txeoxme18f6
        foreign key (organization_id) references ticket_store_db.organizations (id),
    constraint FK96wjp3pil3r8a4tq6h2vwlfe3
        foreign key (user_id) references ticket_store_db.users (id),
    constraint FKfov8obvofaw2ifxlm2jcqad55
        foreign key (role_id) references ticket_store_db.roles (id)
);

create table ticket_store_db.venues
(
    id             bigint auto_increment
        primary key,
    address        varchar(255) null,
    capacity       int          null,
    city           varchar(255) null,
    district       varchar(255) null,
    map_image      varchar(255) null,
    name           varchar(255) null,
    province       varchar(255) null,
    street_address varchar(255) null,
    ward           varchar(255) null
);

create table ticket_store_db.events
(
    id                         bigint auto_increment
        primary key,
    allow_attendee_name_change bit                                                          null,
    allow_ticket_transfer      bit                                                          null,
    category                   varchar(255)                                                 null,
    banner_url                 longtext                                                     null,
    cover_image                longtext                                                     null,
    created_at                 datetime(6)                                                  null,
    custom_url                 varchar(255)                                                 null,
    description                text                                                         null,
    end_time                   datetime(6)                                                  null,
    event_code                 varchar(255)                                                 null,
    logo_url                   longtext                                                     null,
    name                       varchar(255)                                                 null,
    organizer_id               binary(16)                                                   null,
    privacy                    enum ('PUBLIC', 'PRIVATE')                                   null,
    refund_deadline_hours      int                                                          null,
    refund_enabled             bit                                                          null,
    refund_fee_percent         double                                                       null,
    start_time                 datetime(6)                                                  null,
    status                     enum ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'CANCELLED') null,
    updated_at                 datetime(6)                                                  null,
    venue_id                   bigint                                                       null,
    constraint FKqdxygdernwwt74hdvix9u5nr3
        foreign key (venue_id) references ticket_store_db.venues (id)
);

create table ticket_store_db.discounts
(
    id                   bigint auto_increment
        primary key,
    code                 varchar(255)   null,
    discount_amount      decimal(38, 2) null,
    discount_percent     int            null,
    minimum_order_amount decimal(38, 2) null,
    usage_limit          int            null,
    used_count           int            null,
    valid_from           datetime(6)    null,
    valid_to             datetime(6)    null,
    event_id             bigint         null,
    constraint FKc4fy1byqccjplvy7y1nxm5pky
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.ticket_types
(
    id             bigint auto_increment
        primary key,
    code           varchar(255)   null,
    description    text           null,
    end_sale       datetime(6)    null,
    name           varchar(255)   null,
    price          decimal(38, 2) null,
    purchase_limit int            null,
    quota          int            null,
    start_sale     datetime(6)    null,
    event_id       bigint         null,
    constraint FKl83j9knh8jrssp3skaeubrrk
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.event_showtimes
(
    id         bigint auto_increment
        primary key,
    code       varchar(255) null,
    end_time   datetime(6)  null,
    start_time datetime(6)  null,
    event_id   bigint       null,
    constraint FKevent_showtimes_event
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.showtime_ticket_allocations
(
    id            bigint auto_increment
        primary key,
    quantity      int    null,
    showtime_id   bigint null,
    ticket_type_id bigint null,
    constraint FKshowtime_alloc_showtime
        foreign key (showtime_id) references ticket_store_db.event_showtimes (id),
    constraint FKshowtime_alloc_ticket_type
        foreign key (ticket_type_id) references ticket_store_db.ticket_types (id)
);

create table ticket_store_db.ticket_zones
(
    id             bigint auto_increment
        primary key,
    check_in_time  datetime(6)  null,
    code           varchar(255) null,
    name           varchar(255) null,
    event_id       bigint       null,
    ticket_type_id bigint       null,
    constraint FKticket_zones_event
        foreign key (event_id) references ticket_store_db.events (id),
    constraint FKticket_zones_ticket_type
        foreign key (ticket_type_id) references ticket_store_db.ticket_types (id)
);

create table ticket_store_db.check_in_logs
(
    id            bigint auto_increment
        primary key,
    ticket_id     bigint                             null,
    event_id      bigint                             null,
    user_id       varchar(255)                       null,
    check_in_time datetime(6)                        null,
    updated_at    datetime(6)                        null,
    constraint FK_checkin_ticket
        foreign key (ticket_id) references ticket_store_db.tickets (id)
);

create table ticket_store_db.event_organizer_info
(
    id             bigint auto_increment
        primary key,
    account_status varchar(255) null,
    description    text         null,
    logo_url       longtext     null,
    organizer_code varchar(255) null,
    organizer_name varchar(255) null,
    terms_agreed   bit          null,
    event_id       bigint       null,
    constraint FKorganizer_info_event
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.event_payout_info
(
    id                  bigint auto_increment
        primary key,
    account_holder_name varchar(255) null,
    bank_name           varchar(255) null,
    bank_number         varchar(255) null,
    event_id            bigint       null,
    constraint FKpayout_info_event
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.event_invoice_info
(
    id           bigint auto_increment
        primary key,
    address      varchar(255) null,
    company_name varchar(255) null,
    enabled      bit          null,
    tax_code     varchar(255) null,
    event_id     bigint       null,
    constraint FKinvoice_info_event
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.seats
(
    id             bigint auto_increment
        primary key,
    is_available   bit          null,
    locked         bit          null,
    row_label      varchar(255) null,
    seat_category  varchar(255) null,
    seat_number    varchar(255) null,
    section        varchar(255) null,
    event_id       bigint       null,
    ticket_type_id bigint       null,
    constraint FKk0va4h6b6inoh8ac1ejh66ywm
        foreign key (ticket_type_id) references ticket_store_db.ticket_types (id),
    constraint FKn8dwqflg9k82ygrbsseghd7ca
        foreign key (event_id) references ticket_store_db.events (id)
);

create table ticket_store_db.ticket_config_snapshots
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6)  null,
    event_code varchar(255) null,
    event_id   bigint       null,
    payload    longtext     null
);
