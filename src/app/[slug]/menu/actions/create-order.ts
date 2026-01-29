"use server";

import { ConsumptionMethod, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

import { removeCpfPunctuation } from "../helpers/cpf";

interface CreateOrderInput {
  customerName: string;
  customerCpf: string;
  products: Array<{
    id: string;
    quantity: number;
  }>;
  consumptionMethod: ConsumptionMethod;
  slug: string;
}

export const createOrder = async (input: CreateOrderInput) => {
  const restaurant = await db.restaurant.findUnique({
    where: { slug: input.slug },
  });

  if (!restaurant) throw new Error("Restaurant not found");

  const productsWithPrices = await db.product.findMany({
    where: {
      id: { in: input.products.map((product) => product.id) },
    },
  });

  const order = await db.order.create({
    data: {
      status: OrderStatus.PENDING,
      customerName: input.customerName,
      customerCpf: removeCpfPunctuation(input.customerCpf),
      orderProducts: {
        createMany: {
          data: input.products.map((product) => ({
            productId: product.id,
            quantity: product.quantity,
            price: productsWithPrices.find((p) => p.id === product.id)!.price,
          })),
        },
      },
      total: input.products.reduce((acc, product) => {
        const price = productsWithPrices.find(
          (p) => p.id === product.id,
        )!.price;
        return acc + price * product.quantity;
      }, 0),
      consumptionMethod: input.consumptionMethod,
      restaurantId: restaurant.id,
    },
  });

  // 💰 pagamento simulado
  await db.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PAID },
  });

  // 🔥 ESSENCIAL
  revalidatePath(`/${input.slug}/orders`);

  return order;
};
