import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext } from "../contexts/cart";
import CartProductItem from "./cart-product-item";
import FinishOrderDialog from "./finish-order-dialog";
import { Separator } from "@/components/ui/separator";

const CartSheet = () => {
  const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] = useState(false);
  const { isOpen, toggleCart, products, total } = useContext(CartContext);
  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-[80%]">
        <SheetHeader>
          <SheetTitle className="text-left">Sacola</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col py-5">
          <div className="flex-auto">
            {products.map((product) => (
              <CartProductItem key={product.id} product={product} />
            ))}
          </div>
          <Card className="mx-4 mb-3 rounded-2xl">
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-gray-400">Subtotal</p>
                <p className="font-medium">{formatCurrency(total)}</p>
              </div>

              <Separator className="my-1" />

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-gray-400">Descontos</p>
                <p className="font-medium">{formatCurrency(0)}</p>
              </div>

              <Separator className="my-1" />

              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Total</p>
                <p className="text-lg font-bold">{formatCurrency(total)}</p>
              </div>
            </CardContent>
          </Card>

          <Button
            className="mx-4 h-16 w-[calc(100%-2rem)] rounded-full bg-red-600 text-lg font-semibold text-white hover:bg-red-700"
            onClick={() => setFinishOrderDialogIsOpen(true)}
          >
            Finalizar pedido
          </Button>
          <FinishOrderDialog
            open={finishOrderDialogIsOpen}
            onOpenChange={setFinishOrderDialogIsOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
