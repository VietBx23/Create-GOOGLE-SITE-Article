# GSite Automator (Create-GOOGLE-SITE-Article)

Đây là dự án GSite Automator, một ứng dụng nền tảng web được phát triển bằng Next.js và Firebase Studio, được thiết kế để tự động hóa và tăng tốc quá trình tạo hàng loạt bài viết độc đáo cho Google Sites. Ứng dụng tích hợp AI để hỗ trợ tạo từ khóa và nội dung, giúp người dùng tiết kiệm thời gian và công sức đáng kể.

## ✨ Tính năng chính

- **Tạo bài viết hàng loạt:** Dựa trên một danh sách từ khóa phụ, ứng dụng có thể tạo ra hàng chục bài viết chỉ trong một cú nhấp chuột.
- **Cấu trúc tiêu đề độc đáo:** Tự động trộn các từ khóa chính, từ khóa phụ và các thông tin tùy chỉnh để tạo ra các tiêu đề dài, độc đáo và tối ưu cho SEO.
- **Nội dung dựa trên mẫu (Template):** Sử dụng các mẫu nội dung có sẵn, tự động điền các thông tin như tiêu đề, từ khóa, liên kết và ngày tháng để tạo ra các bài viết có cấu trúc hoàn chỉnh.
- **AI Keyword Suggester:** Tích hợp AI (Genkit) để gợi ý các từ khóa liên quan dựa trên một chủ đề, giúp người dùng mở rộng ý tưởng và phạm vi nội dung.
- **Giao diện hiện đại và trực quan:** Giao diện được thiết kế đẹp mắt, sang trọng với các hiệu ứng chuyển động tinh tế, mang lại trải nghiệm người dùng cao cấp.
- **Sao chép và Tải xuống dễ dàng:** Cho phép sao chép tiêu đề và nội dung (định dạng HTML) hoặc tải xuống bài viết dưới dạng tệp `.txt` một cách nhanh chóng.
- **AI Playground:** Một không gian thử nghiệm để tương tác trực tiếp với mô hình ngôn ngữ AI.

## 🚀 Hướng dẫn sử dụng

Giao diện chính của ứng dụng được thiết kế để sử dụng một cách đơn giản và hiệu quả.

### 1. Nhập từ khóa chính (Primary Keywords)

-   **Mục đích:** Đây là những từ khóa cốt lõi, thường là tên thương hiệu hoặc chủ đề chính. Các từ khóa này sẽ được tái sử dụng và phân phối đều vào các bài viết được tạo ra.
-   **Cách nhập:** Nhập các từ khóa, mỗi từ khóa cách nhau bởi dấu phẩy (`,`) hoặc xuống dòng.
-   **AI Suggester:** Nếu bạn cần ý tưởng, hãy nhấp vào nút **AI Suggester**, nhập một chủ đề và AI sẽ gợi ý các từ khóa liên quan. Bạn có thể sao chép các gợi ý này và dán vào ô nhập liệu.

### 2. Nhập từ khóa phụ (Secondary Keywords)

-   **Mục đích:** Đây là danh sách các từ khóa mở rộng. Mỗi từ khóa phụ trong danh sách này sẽ được sử dụng để tạo ra một bài viết riêng biệt.
-   **Cách nhập:** Nhập các từ khóa, mỗi từ khóa cách nhau bởi dấu phẩy (`,`) hoặc xuống dòng. Số lượng bài viết được tạo ra sẽ bằng số lượng từ khóa phụ.

### 3. Cấu hình liên kết và giá trị tùy chỉnh

-   **Domain Link:** Nhập tên miền (ví dụ: `example.com`) mà bạn muốn chèn vào các bài viết. Có thể chọn từ các nút preset có sẵn.
-   **CY Value:** Một giá trị tùy chỉnh (ví dụ: `2025`) để thêm vào tiêu đề, giúp tạo sự khác biệt.

### 4. Tạo bài viết

-   Sau khi đã điền đầy đủ thông tin, nhấp vào nút **Generate Articles**.
-   Ứng dụng sẽ xử lý và hiển thị một danh sách các bài viết đã được tạo ra ở phía dưới.

### 5. Sử dụng kết quả

Với mỗi bài viết trong danh sách kết quả, bạn có các tùy chọn:
-   **Copy Title:** Sao chép tiêu đề (đã bao gồm liên kết dưới dạng mã HTML) vào clipboard.
-   **Copy Content:** Sao chép toàn bộ nội dung bài viết (dưới dạng mã HTML) vào clipboard.
-   **Download:** Tải bài viết về máy dưới dạng một tệp văn bản (`.txt`).

## 🛠️ Công nghệ sử dụng

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Ngôn ngữ:** TypeScript
-   **AI/Generative:** Google AI - [Genkit](https://firebase.google.com/docs/genkit)
-   **Giao diện người dùng:** [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
-   **Quản lý Form:** React Hook Form & Zod
-   **Icons:** Lucide React

## 🔧 Cài đặt và Chạy trên máy tính cá nhân

1.  **Sao chép kho chứa:**
    ```bash
        git clone https://github.com/VietBx23/Create-GOOGLE-SITE-Article.git
            cd Create-GOOGLE-SITE-Article
                ```

                2.  **Cài đặt các gói phụ thuộc:**
                    ```bash
                        npm install
                            ```

                            3.  **Cấu hình biến môi trường:**
                                -   Tạo một tệp `.env.local` ở thư mục gốc.
                                    -   Thêm `GEMINI_API_KEY` của bạn vào tệp này để các tính năng AI hoạt động.
                                        ```
                                            GEMINI_API_KEY=YOUR_API_KEY_HERE
                                                ```

                                                4.  **Chạy ứng dụng:**
                                                    ```bash
                                                        npm run dev
                                                            ```

                                                                Mở [http://localhost:9002](http://localhost:9002) trong trình duyệt của bạn để xem ứng dụng.
                                                                
