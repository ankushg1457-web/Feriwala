# Feriwala - Quick Commerce Platform

Delivering clothes in minutes.

## Architecture

```
├── backend/          # Node.js API server
├── admin-portal/     # React.js admin web portal
├── feriwala_customer/ # Flutter customer app
├── feriwala_shop/     # Flutter shop/outlet app
├── feriwala_delivery/ # Flutter delivery/picker app
└── deployment/        # Server configs & scripts
```

## Tech Stack

| Component        | Technology              |
|-----------------|------------------------|
| Mobile Apps      | Flutter (Android)       |
| Backend API      | Node.js + Express       |
| Admin Portal     | React.js                |
| User Database    | MongoDB (Atlas Free)    |
| Product Database | PostgreSQL              |
| Maps             | Google Maps API         |
| Server           | AWS Bitnami             |

## Services

- **Customer App**: Browse products, place orders, track delivery, manage returns
- **Shop App**: Manage inventory, create deals/promos, handle orders, invoicing
- **Delivery App**: Pick items, deliver orders, handle returns with verification
- **Admin Portal**: Register shops, manage platform settings

## Server

- Public IPv4: 13.233.227.15
- Public IPv6: 2406:da1a:19e:d100:a0e2:d3b3:4b57:29ef
