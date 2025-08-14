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
  birthDate: z.date({ required_error: "A date of birth is required." }),
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
  const cardRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      contactNumber: "",
    },
  });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = (currentTarget as HTMLElement).getBoundingClientRect();
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;

      const rotateX = (y - 0.5) * -30;
      const rotateY = (x - 0.5) * 30;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("contactNumber", values.contactNumber);
    formData.append("birthDate", format(values.birthDate, "dd-MM-yyyy"));
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
    <Card ref={cardRef} className="w-full shadow-lg transition-transform duration-300 ease-out hover:shadow-2xl hover:shadow-primary/20 border border-primary/20" style={{ transformStyle: 'preserve-3d' }}>
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
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal hover:border-primary",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd-MM-yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
