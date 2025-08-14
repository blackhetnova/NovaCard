"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, UploadCloud, CheckCircle, AlertCircle, X } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { submitData } from "@/app/actions";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  contactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid contact number."),
  birthDate: z.string().refine((val) => /^\d{2}-\d{2}-\d{4}$/.test(val), {
    message: "Please enter a valid date in DD-MM-YYYY format.",
  }),
  profilePic: z
    .any()
    .refine((files) => files?.length === 1, "Profile picture is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png", "image/gif"].includes(files?.[0]?.type),
      "Only .jpg, .png, and .gif formats are supported."
    ),
  signature: z
    .any()
    .refine((files) => files?.length === 1, "Signature is required.")
    .refine((files) => files?.[0]?.size <= 2000000, `Max file size is 2MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png"].includes(files?.[0]?.type),
      "Only .jpg and .png formats are supported."
    ),
});

type FormValues = z.infer<typeof formSchema>;

const FileUpload = ({ field, label, description, fileTypeDescription, form }: { field: any, label: string, description: string, fileTypeDescription: string, form: any }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const {formState: {errors}} = form;
  const fieldError = errors[field.name];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(e.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      field.onChange(undefined);
      setPreview(null);
    }
  };
  
  const resetFile = () => {
    field.onChange(undefined);
    setPreview(null);
    const fileInput = document.getElementById(field.name) as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
  }


  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input 
            type="file" 
            id={field.name}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
          <div className={cn(
            "flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-accent/50 transition-colors hover:bg-accent hover:border-primary",
            {"border-destructive": fieldError}
          )}>
              {preview ? (
                <div className="relative h-full w-full">
                    <Image src={preview} alt="Preview" layout="fill" objectFit="contain" className="rounded-lg" />
                     <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 z-20" onClick={resetFile}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                <div className="text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                    <p className="text-xs text-muted-foreground">{fileTypeDescription}</p>
                </div>
              )}
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export function DataForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      contactNumber: "",
      birthDate: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("contactNumber", values.contactNumber);
    formData.append("birthDate", values.birthDate);
    formData.append("profilePic", values.profilePic[0]);
    formData.append("signature", values.signature[0]);

    const result = await submitData(formData);

    if (result.success) {
      toast({
        title: "Success",
        description: "Your details have been submitted successfully.",
        variant: "default",
      });
      form.reset();
      // Manually trigger reset for file inputs preview
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        // This is a bit of a hack to get the FileUpload component to reset its preview
        const parentFormItem = (input as HTMLElement).closest('div.relative');
        const resetButton = parentFormItem?.querySelector('button[variant="destructive"]') as HTMLButtonElement;
        resetButton?.click();
      });

    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <Card className="w-full shadow-lg border border-primary/20">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} className="focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +919876543210" type="tel" {...field} className="focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input placeholder="DD-MM-YYYY" {...field} className="focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profilePic"
              render={({ field }) => <FileUpload form={form} field={field} label="Profile Picture" description="Click or drag file to upload" fileTypeDescription="PNG, JPG, GIF up to 5MB" />}
            />
            
            <FormField
              control={form.control}
              name="signature"
              render={({ field }) => <FileUpload form={form} field={field} label="Signature" description="Click or drag file to upload" fileTypeDescription="PNG, JPG up to 2MB" />}
            />

            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Details"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
