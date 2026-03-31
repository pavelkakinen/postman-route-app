# Postman Route App

## Problem
Postal workers receive a printed paper table every day with ~200 addresses and newspaper/magazine names for delivery. There is no route optimization — the postman decides the order themselves. This is inefficient and wastes time.

## Solution
A web application (later mobile) that:
1. Accepts a list of addresses + newspapers (CSV upload or manual input)
2. Geocodes addresses into coordinates (Nominatim / OpenStreetMap — free)
3. Optimizes the delivery route (nearest neighbor algorithm, improvable later)
4. Displays the route on a map with step-by-step navigation
5. Shows which newspaper to deliver at each stop

## Tech Stack
- Frontend: React + Vite
- Map: Leaflet + react-leaflet + OpenStreetMap tiles
- Geocoding: Nominatim API (free, 1 req/sec)
- Routing: OSRM (Open Source Routing Machine — free)
- CSV parsing: papaparse
- Styling: CSS modules or plain CSS (minimalist)
- Deployment: Vercel or Netlify (later)

## MVP Features (v0.1)
- [ ] CSV file upload (columns: address, newspaper)
- [ ] Geocode addresses via Nominatim
- [ ] Display points on a map (Leaflet)
- [ ] Optimize delivery order (nearest neighbor)
- [ ] Step-by-step mode: current address + newspaper + "Delivered" button
- [ ] Route line on map between points

## CSV Format
address,newspaper
Kuninga 20 Pärnu,Postimees
Rüütli 44 Pärnu,Õhtuleht
Akadeemia 5 Pärnu,Postimees

## Future Features (v0.2+)
- OCR: photograph the paper table → recognize addresses
- Mobile app (React Native / Expo)
- Save route history
- Transport mode support (walking / bicycle / car)
- Google Maps integration for navigation
- Offline mode
