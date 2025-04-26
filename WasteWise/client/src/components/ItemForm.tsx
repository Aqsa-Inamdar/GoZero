import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertItemSchema } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = insertItemSchema.extend({
  type: z.enum(["sell", "donate"]),
  price: z.number().min(0).optional(),
  tags: z.string().optional().transform(val => val ? val.split(",").map(t => t.trim()) : []),
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  "Food",
  "Furniture",
  "Electronics",
  "Clothes",
  "Books",
  "Other"
];

export default function ItemForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [itemType, setItemType] = useState<"sell" | "donate">("donate");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      title: "",
      description: "",
      category: "",
      type: "donate",
      price: undefined,
      status: "available",
      location: user?.location || "",
      tags: "",
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a listing.",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure userId is set from the current user
      data.userId = user.id;
      
      // Convert tags from string to array if needed
      if (typeof data.tags === "string") {
        data.tags = data.tags.split(",").map(tag => tag.trim());
      }
      
      // If type is donate, remove price
      if (data.type === "donate") {
        data.price = undefined;
      }
      
      // Add mock images for now (in a real app, we'd upload images)
      data.images = ["https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&auto=format&fit=crop&q=60"];
      
      await apiRequest("POST", "/api/items", data);
      
      toast({
        title: "Listing created!",
        description: `Your ${data.type === "donate" ? "donation" : "sale"} listing has been created successfully.`,
      });
      
      // Reset the form
      form.reset();
      
      // Invalidate queries to refresh item lists
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/items`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create your listing. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Create a New Listing</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sell or Donate Selection */}
          <div className="mb-6">
            <FormLabel>What would you like to do?</FormLabel>
            <div className="flex space-x-4 mt-2">
              <Button
                type="button"
                className={`flex-1 py-6 ${
                  itemType === "sell" 
                    ? "bg-secondary-50 border-2 border-secondary-400 text-secondary-500" 
                    : "bg-white border-2 border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                }`}
                onClick={() => {
                  setItemType("sell");
                  form.setValue("type", "sell");
                }}
              >
                <i className="fas fa-tag text-xl mr-2"></i>
                <span>Sell</span>
              </Button>
              <Button
                type="button"
                className={`flex-1 py-6 ${
                  itemType === "donate" 
                    ? "bg-primary-50 border-2 border-primary-400 text-primary-500" 
                    : "bg-white border-2 border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                }`}
                onClick={() => {
                  setItemType("donate");
                  form.setValue("type", "donate");
                }}
              >
                <i className="fas fa-gift text-xl mr-2"></i>
                <span>Donate</span>
              </Button>
            </div>
          </div>
          
          {/* Upload Photos */}
          <div className="mb-6">
            <FormLabel>Upload Photos</FormLabel>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center mt-2">
              <i className="fas fa-camera text-4xl text-neutral-400 mb-2"></i>
              <p className="text-neutral-500">Tap to upload photos</p>
              <p className="text-neutral-400 text-sm mt-1">Add up to 5 photos</p>
            </div>
          </div>
          
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="What are you sharing?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add details like condition, quantity, etc." 
                    className="h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (if applicable)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Price (only if selling) */}
          {itemType === "sell" && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="Organic, Perishable, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Add tags to help people find your listing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Your address or area" {...field} />
                </FormControl>
                <FormDescription className="flex items-center text-primary-500">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <span>Using your current location</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit Buttons */}
          <div className="flex justify-end">
            <Button type="button" variant="outline" className="mr-3">
              Cancel
            </Button>
            <Button type="submit">
              Create Listing
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
