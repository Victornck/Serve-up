"use server";

import { db } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function simulatePayment(orderId: number, slug: string) {
  await db.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PAID },
  });
  revalidatePath(`/${slug}/orders`);
}

