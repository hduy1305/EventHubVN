# EvenHub – Real-Time Event Management & Ticketing Platform

## 🧩 Tech Stack

### **Frontend**
- TypeScript  
- ReactJS  

### **Backend**
- Python  
- Django  

### **Database**
- PostgreSQL  
- Redis (real-time seat locking & queue)  
- Elasticsearch (optional – search)  

---

## Tổng quan dự án

**EvenHub** là nền tảng hỗ trợ quản lý sự kiện và bán vé **thời gian thực**, giúp kết nối **người tham dự**, **nhà tổ chức**, và **nhân viên vận hành** trong một hệ thống ổn định, bảo mật và chống đặt trùng.

Hệ thống xử lý toàn bộ vòng đời một sự kiện: tạo sự kiện → bán vé → check-in tại cổng → báo cáo.

---

## Đối tượng sử dụng

---

## Người tham dự (Attendee)

- Duyệt, tìm kiếm và lọc sự kiện theo:
  - Thời gian  
  - Địa điểm  
  - Thể loại  
  - Giá  
- Xem chi tiết sự kiện:
  - Mô tả  
  - Sơ đồ ghế (nếu có)  
  - Trạng thái vé còn / hết **thời gian thực**  
- Giữ chỗ tạm thời khi chọn ghế (countdown)  
- Giỏ hàng, áp mã giảm giá / voucher  
- Thanh toán đa phương thức  
- Nhận vé PDF/QR qua email hoặc SMS  
- Quản lý đơn & vé:
  - Xem lại  
  - Tải lại  
  - Chuyển nhượng/đổi tên nếu được phép  
- Yêu cầu hoàn/hủy theo chính sách  

---

## Nhà tổ chức (Organizer)

- Tạo & quản lý sự kiện:
  - Thông tin  
  - Thời gian  
  - Địa điểm  
  - Ảnh bìa  
  - Chính sách hoàn/hủy  
- Cấu hình vé:
  - Loại vé (Early-bird, Standard, VIP…)  
  - Giá theo giai đoạn  
  - Hạn mức/quota  
- Sơ đồ ghế:
  - Khu vực – hàng – ghế  
  - Import sơ đồ ghế  
  - Khóa khu vực riêng  
- Công cụ bán riêng:
  - Private link  
  - Whitelist email/SĐT  
  - Giới hạn số vé mỗi người  
- Quản lý đơn hàng:
  - Tra cứu  
  - Đổi thông tin  
  - Hoàn tiền / void  
  - Gửi lại vé  
- Dashboard:
  - Doanh thu  
  - Vé bán  
  - Kênh bán  
  - Xuất CSV  

---

## Nhân viên sự kiện (Staff)

- Ứng dụng quét QR  
- Phát hiện quét trùng  
- Check-in thủ công  
- Đồng bộ thời gian thực giữa nhiều thiết bị  
- Danh sách khách tham dự  
- Phân quyền theo cổng/khu vực  
- Nhật ký check-in  
- Xuất danh sách  

---

## Quản trị hệ thống (Admin)

- Quản lý tổ chức  
- Quản lý vai trò & quyền:
  - Admin  
  - Organizer  
  - Staff  
  - User  
- Cấu hình hệ thống:
  - Thanh toán  
  - Thuế & phí  
  - Chính sách hoàn/hủy  
- Trung tâm hỗ trợ:
  - Tiếp nhận yêu cầu khách  
  - Xử lý tranh chấp thanh toán  
- Quản lý nội dung tĩnh:
  - Điều khoản  
  - Chính sách quyền riêng tư  
  - Trang thông tin  

---

## Tìm kiếm, thông báo & tương tác

- Trang Explore với phân loại theo:
  - Chủ đề  
  - Xu hướng  
  - Khu vực  
- Thông báo email/SMS:
  - Xác nhận đơn  
  - Nhắc lịch sự kiện  
  - Thông báo thay đổi  
- Tracking marketing:
  - UTM  
  - Affiliate link (optional)  

---

## Báo cáo & phân tích

- Doanh thu theo thời gian  
- Tỷ lệ chuyển đổi  
- Hiệu quả theo kênh bán  
- Tồn kho vé theo thời gian thực  
- Tốc độ bán theo phút/giờ  
- Xuất báo cáo CSV  

---

## Luồng hoạt động

1. Người tham dự duyệt và tìm sự kiện  
2. Chọn vé / ghế  
3. Hệ thống **khóa tạm ghế** (Redis lock + countdown)  
4. Người dùng thanh toán  
5. Hệ thống gửi vé PDF/QR  
6. Nhà tổ chức theo dõi bán hàng  
7. Tại sự kiện, nhân viên check-in  
8. Dữ liệu đồng bộ real-time lên dashboard  

---

## Logic quan trọng

- **Real-time seat status** (Redis pub/sub)  
- **Seat temporary lock** – chống chiếm chỗ  
- **Prevent double booking**  
- **Role-based access control (RBAC)**  
- **Anti-scalper** – giới hạn vé / tài khoản  
- **Real-time check-in**  

---

## Cơ sở dữ liệu tổng quan (chưa chia db cho từng service)

![db_tong_quan(chua chia service)](https://github.com/user-attachments/assets/9f7a7add-77fc-4fb5-a7df-ab095f049ba4)



---


