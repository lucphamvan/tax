import { AuthenInput } from "@/types/captcha";

export const login = async (data: AuthenInput) => {
  const response = await fetch(
    "https://hoadondientu.gdt.gov.vn:30000/security-taxpayer/authenticate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  const responseData = await response.json();
  return responseData.token;
};
