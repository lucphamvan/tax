"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Button,
  TextField,
  Text,
  Flex,
  Box,
  Heading,
  Grid,
  AlertDialog,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { getCaptcha } from "@/service/captcha";
import { AuthenInput } from "@/types/captcha";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/core/card";
import { useRef, useState } from "react";

type LoginRequest = {
  username: string;
  password: string;
  captcha: string;
};

const LoginPage = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>();

  const router = useRouter();
  const { data, refetch } = useQuery({
    queryKey: ["captcha"],
    queryFn: getCaptcha,
    refetchOnWindowFocus: false,
  });
  const ref = useRef<any>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const onSubmit: SubmitHandler<LoginRequest> = async (request) => {
    try {
      const authenInput: AuthenInput = {
        username: request.username,
        password: request.password,
        cvalue: request.captcha,
        ckey: data?.key || "",
      };
      await axios.post("/api/login", authenInput);
      router.push("/");
    } catch (error: any) {
      setAlertMessage(error.response?.data?.message);
      ref.current?.click();
    }
  };

  return (
    <Flex
      height="100vh"
      width="100%"
      direction="column"
      justify="center"
      align="center"
    >
      <Box width="30%" minWidth="300px" maxWidth="400px">
        <Card size="3">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex gap="4" direction="column">
              <Heading>Đăng Nhập</Heading>
              <Box>
                <Text as="label" htmlFor="username">
                  Tên đăng nhập
                </Text>
                <TextField.Root id="username" {...register("username")} />
              </Box>
              <Box>
                <Text as="label" htmlFor="password">
                  Mật khẩu
                </Text>
                <TextField.Root
                  type="password"
                  id="password"
                  {...register("password")}
                />
              </Box>
              <div
                dangerouslySetInnerHTML={{
                  __html: data?.content || "",
                }}
                style={{ width: "100%", height: "auto" }}
              />
              <Grid columns="2" width="auto" gap="3" align="center">
                <TextField.Root
                  id="captcha"
                  {...register("captcha")}
                  placeholder="captcha"
                />
                <Button type="button" onClick={() => refetch()}>
                  Lấy lại captcha
                </Button>
              </Grid>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ cursor: "pointer" }}
              >
                Đăng nhập
              </Button>
            </Flex>
          </form>
        </Card>
      </Box>
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button ref={ref} color="red" style={{ display: "none" }}></Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title className="text-red-400">Đăng nhập thất bại</AlertDialog.Title>
          <AlertDialog.Description size="2">
            {alertMessage}
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Action>
              <Button variant="solid" style={{ cursor: "pointer" }} color="red">
                OK
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
};
export default LoginPage;
