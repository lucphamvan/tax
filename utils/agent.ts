import https from "https";

// Tạo một agent tùy chỉnh cho các yêu cầu HTTPS
export const agent = new https.Agent({
  rejectUnauthorized: false, // Bỏ qua kiểm tra chứng chỉ SSL (không khuyến khích trong môi trường sản xuất)
  secureOptions: require("constants").SSL_OP_LEGACY_SERVER_CONNECT, // Cho phép "Legacy Renegotiation"
});
