"use client";

import { simulatePayment } from "@/app/[slug]/menu/actions/simulate-payment";

import { ConsumptionMethod, OrderStatus, Prisma } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/helpers/format-currency";

interface OrderListProps {
  orders: Array<
    Prisma.OrderGetPayload<{
      include: {
        restaurant: {
          select: {
            name: true;
            avatarImageUrl: true;
          };
        };
        orderProducts: {
          include: {
            product: true;
          };
        };
      };
    }>
  >;
}

const getStatusLabel = (status: OrderStatus) => {
  if (status === "FINISHED") return "Finalizado";
  if (status === "PENDING") return "Pendente";
  if (status === "PAID") return "Pago";

  return "";
};

const OrderList = ({ orders }: OrderListProps) => {
  const router = useRouter();
  const handleBackClick = () => router.back();
  const { slug } = useParams<{ slug: string }>();

  const handleSimulatePayment = async (orderId: number) => {
    await simulatePayment(orderId, slug);
    router.refresh();
  };

  return (
    <div className="space-y-6 p-6">
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full"
        onClick={handleBackClick}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="flex items-center gap-3">
        <ScrollTextIcon />
        <h2 className="text-lg font-semibold">Meus Pedidos</h2>
      </div>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-4 px-5">
            <div className="mb-8 flex justify-between">
              <div
                className={`w-fit rounded-full px-2 py-1 text-xs font-semibold text-white ${
                  order.status === OrderStatus.PAID
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              >
                {getStatusLabel(order.status)}
              </div>
              <div
                className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${
                  order.consumptionMethod === "TAKEAWAY"
                    ? "border border-blue-500 bg-transparent text-blue-500"
                    : "border border-black bg-transparent text-black"
                }`}
              >
                {order.consumptionMethod === "TAKEAWAY"
                  ? "Takeaway"
                  : "Dine In"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5">
                <Image
                  src={order.restaurant.avatarImageUrl}
                  alt={order.restaurant.name}
                  className="rounded-sm"
                  fill
                />
              </div>
              <p className="text-sm font-semibold">{order.restaurant.name}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              {order.orderProducts.map((orderProduct) => (
                <div key={orderProduct.id} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white">
                    {orderProduct.quantity}
                  </div>
                  <p className="text-sm">{orderProduct.product.name}</p>
                </div>
              ))}
            </div>
            <Separator />
            <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
            {order.status === OrderStatus.PENDING && (
              <Button
                className="bg-blue-600 text-white hover:bg-green-700"
                onClick={() => handleSimulatePayment(order.id)}
              >
                Simular pagamento
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderList;
