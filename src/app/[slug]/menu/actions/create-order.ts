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
  const restaurant = await db.restaurant.findUnique({ where: { slug: input.slug } });
  if (!restaurant) throw new Error("Restaurant not found");

  const productsWithPrices = await db.product.findMany({
    where: { id: { in: input.products.map(p => p.id) } },
  });

  const order = await db.order.create({
    data: {
      status: OrderStatus.PENDING, // ✅ inicia como PENDENTE
      customerName: input.customerName,
      customerCpf: removeCpfPunctuation(input.customerCpf),
      orderProducts: {
        createMany: {
          data: input.products.map(p => ({
            productId: p.id,
            quantity: p.quantity,
            price: productsWithPrices.find(pp => pp.id === p.id)!.price,
          })),
        },
      },
      total: input.products.reduce((acc, p) => {
        const price = productsWithPrices.find(pp => pp.id === p.id)!.price;
        return acc + price * p.quantity;
      }, 0),
      consumptionMethod: input.consumptionMethod,
      restaurantId: restaurant.id,
    },
  });

  revalidatePath(`/${input.slug}/orders`);

  return order; // sem atualizar para PAID aqui
};
