import { agent } from "@/utils/agent";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const data = await request.json();
  const response = await axios.post(
    "https://hoadondientu.gdt.gov.vn:30000/security-taxpayer/authenticate",
    data,
    {
      httpsAgent: agent,
    }
  );
  const token = response.data.token;
  cookies().set("token", token, {
    maxAge: 60 * 60 * 24,
  });
  return Response.json({ token }, { status: 200 });
}
