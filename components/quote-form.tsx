"use client"

import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { CalendarIcon, Plus, Trash2, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { useInventory } from "@/lib/inventory"
import { generateAndDownloadPdf } from "@/lib/generate-pdf"
import type { QuoteData } from "@/lib/typst-template"
import { cn } from "@/lib/utils"

const lineItemSchema = z.object({
  productId: z.string().min(1, "Válassz terméket"),
  quantity: z.coerce.number().min(1, "Minimum 1"),
  price: z.coerce.number().min(0, "Minimum 0"),
})

const formSchema = z.object({
  customerName: z.string().min(1, "Kötelező mező"),
  customerAddress: z.string().min(1, "Kötelező mező"),
  description: z.string().min(1, "Kötelező mező"),
  date: z.date({ required_error: "Válassz dátumot" }),
  discount: z.coerce.number().min(0).max(100).default(0),
  items: z.array(lineItemSchema).min(1, "Legalább egy tétel szükséges"),
})

type FormValues = z.infer<typeof formSchema>

export function QuoteForm() {
  const [isExporting, setIsExporting] = useState(false)
  
  const inventory = useInventory()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerAddress: "",
      description: "",
      discount: 0,
      items: [{ productId: "", quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchItems = form.watch("items")
  const watchDiscount = form.watch("discount") || 0

  const subtotal = watchItems.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 0)
  }, 0)

  const total = subtotal * (1 - watchDiscount / 100)

  const handleProductChange = (index: number, productId: string) => {
    const product = inventory.find((p) => p.id === productId)
    if (product) {
      form.setValue(`items.${index}.productId`, productId)
      form.setValue(`items.${index}.price`, product.price)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsExporting(true)
    try {
      const quoteData: QuoteData = {
        megrendelő: data.customerName,
        megrendelő_cím: data.customerAddress,
        feladat_leírása: data.description,
        datum: {
          year: data.date.getFullYear(),
          month: data.date.getMonth() + 1,
          day: data.date.getDate(),
        },
        kedvezmény: data.discount,
        tételek: data.items.map((item) => {
          const product = inventory.find((p) => p.id === item.productId)
          return {
            megnevezés: product?.name || "",
            darab: item.quantity,
            ár: item.price,
          }
        }),
      }

      await generateAndDownloadPdf(quoteData)
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("hu-HU").format(price) + " Ft"
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Megrendelő adatai</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="customerName">Megrendelő neve</FieldLabel>
              <Input
                id="customerName"
                placeholder="pl. Wavy Budapest"
                {...form.register("customerName")}
              />
              <FieldError errors={[form.formState.errors.customerName]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="customerAddress">Megrendelő címe</FieldLabel>
              <Input
                id="customerAddress"
                placeholder="pl. 1234 Budapest, Fő utca 1."
                {...form.register("customerAddress")}
              />
              <FieldError errors={[form.formState.errors.customerAddress]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feladat részletei</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="description">Feladat leírása</FieldLabel>
              <Textarea
                id="description"
                placeholder="Írd le a feladatot részletesen..."
                rows={4}
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>

            <Field>
              <FieldLabel>Dátum</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {form.watch("date") ? (
                      format(form.watch("date"), "PPP", { locale: hu })
                    ) : (
                      <span>Válassz dátumot</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={[form.formState.errors.date]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tételek</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-x-3 m-0 sm:flex-row"
            >
              <Field className="flex-1">
                <Select
                  value={form.watch(`items.${index}.productId`)}
                  onValueChange={(value) => handleProductChange(index, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Válassz tételt..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.items?.[index]?.productId]} />
              </Field>
              
              <Field className="w-full sm:w-36">
                <div className="flex items-stretch">
                  <Input
                    type="number"
                    min={1}
                    {...form.register(`items.${index}.quantity`)}
                    className="rounded-r-none"
                  />

                  <div className="flex items-center px-3 border border-l-0 rounded-r-md text-sm text-muted-foreground bg-muted">
                    db
                  </div>
                </div>

                <FieldError errors={[form.formState.errors.items?.[index]?.quantity]} />
              </Field>

              <Field className="w-full sm:w-36">
                <div className="flex items-stretch">
                  <Input
                    type="number"
                    min={0}
                    {...form.register(`items.${index}.price`)}
                    className="rounded-r-none"
                  />

                  <div className="flex items-center px-3 border border-l-0 rounded-r-md text-sm text-muted-foreground bg-muted">
                    Ft/db
                  </div>
                </div>

                <FieldError errors={[form.formState.errors.items?.[index]?.price]} />
              </Field>

		          <Button
		            type="button"
		            variant="ghost"
		            size="icon"
		            onClick={() => remove(index)}
		            disabled={fields.length === 1}
		            className="text-destructive hover:bg-destructive/20 hover:text-destructive"
		          >
		            <Trash2 className="size-4" />
		          </Button>
            </div>
          ))}

          <FieldError errors={[form.formState.errors.items]} />
        </CardContent>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: "", quantity: 1, price: 0 })}
          >
            <Plus className="mr-2 size-4" />
            Tétel hozzáadása
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Összesítés</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal" className="items-center">
              <FieldLabel htmlFor="discount" className="flex-shrink-0">
                Kedvezmény
              </FieldLabel>
              <div className="flex items-stretch">
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    max={100}
                    className="w-24 rounded-r-none"
                    {...form.register("discount")}
                  />

                  <div className="flex items-center px-3 border border-l-0 rounded-r-md text-sm text-muted-foreground bg-muted">
                    %
                  </div>
                </div>
            </Field>

            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span>Részösszeg:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {watchDiscount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Kedvezmény ({watchDiscount}%):</span>
                  <span>-{formatPrice(subtotal - total)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Összesen:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isExporting}>
        {isExporting ? (
          <>
            <Spinner className="mr-2" />
            PDF generálása...
          </>
        ) : (
          <>
            <FileDown className="mr-2 size-5" />
            Exportálás PDF-be
          </>
        )}
      </Button>
    </form>
  )
}
