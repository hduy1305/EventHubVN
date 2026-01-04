#!/bin/bash
# Fix all Grid item elements by adding component="div" prop

# EventFormPage.tsx
sed -i 's/<Grid item xs={12} md={8}>/<Grid item component="div" xs={12} md={8}>/g' d:/EventHub/EventHub_fe/src/pages/EventFormPage.tsx
sed -i 's/<Grid item xs={12} md={4}>/<Grid item component="div" xs={12} md={4}>/g' d:/EventHub/EventHub_fe/src/pages/EventFormPage.tsx
sed -i 's/<Grid item xs={12}\s*>\s*<\/TextField>/<Grid item component="div" xs={12}>\n                    <\/TextField>/g' d:/EventHub/EventHub_fe/src/pages/EventFormPage.tsx
sed -i 's/<Grid item xs={12} sm={6}>/<Grid item component="div" xs={12} sm={6}>/g' d:/EventHub/EventHub_fe/src/pages/EventFormPage.tsx

# TicketTypeManagement.tsx
sed -i 's/<Grid item xs={12} sm={6}>/<Grid item component="div" xs={12} sm={6}>/g' d:/EventHub/EventHub_fe/src/components/TicketTypeManagement.tsx
sed -i 's/<Grid item xs={12}>/<Grid item component="div" xs={12}>/g' d:/EventHub/EventHub_fe/src/components/TicketTypeManagement.tsx

# SeatManagement.tsx
sed -i 's/<Grid item xs={12} sm={3}>/<Grid item component="div" xs={12} sm={3}>/g' d:/EventHub/EventHub_fe/src/components/SeatManagement.tsx
sed -i 's/<Grid item xs={12} sm={6}>/<Grid item component="div" xs={12} sm={6}>/g' d:/EventHub/EventHub_fe/src/components/SeatManagement.tsx
sed -i 's/<Grid item xs={12}>/<Grid item component="div" xs={12}>/g' d:/EventHub/EventHub_fe/src/components/SeatManagement.tsx

echo "Fixed all Grid item elements"
