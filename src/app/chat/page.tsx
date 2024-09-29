"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Message } from "../lib/definitions";

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

const formSchema = z.object({
  input: z.string().max(500),
});

const getAnswer = async (question: string) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/ask",
      { question },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching the answer:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

const Chat = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: "",
    },
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState<boolean>(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setMessages((prev) => [
      ...prev,
      {
        id: generateRandomString(10),
        message: values.input,
        type: "user",
      },
    ]);
    form.setValue("input", "");
    setThinking(true);

    const data = await getAnswer(values.input);
    setMessages((prev) => [
      ...prev,
      {
        id: generateRandomString(10),
        message: data.response,
        type: "bot",
      },
    ]);
    setThinking(false);
  }

  return (
    <div className="items-center flex flex-col h-screen">
      {thinking && <p>thinking...</p>}
      <div
        className="w-[70%] p-4"
        style={{ height: "calc(100vh - 150px)", overflowY: "auto" }}
      >
        {messages.length > 0 ? (
          messages.map((m) => {
            return (
              <div
                key={m.id}
                className={clsx("mb-4 flex", {
                  "justify-end": m.type === "user", // Align user messages to the right
                  "justify-start": m.type === "bot", // Align bot messages to the left
                })}
              >
                <div className="max-w-[50%] box h-auto bg-gray-100 p-2 rounded">
                  <p className="break-words">{m.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="">Chat With You Assistant</div>
        )}
      </div>

      <div className="bg-white w-[50%] h-[100px] fixed bottom-0 flex gap-2 p-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-x-2 w-full flex"
          >
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      autoComplete="off"
                      className="w-full"
                      placeholder="Eg: Getting TLE in Linear Search"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Send</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Chat;
