"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateContentAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sparkles,
  Loader2,
  Home,
  ClipboardCopy,
  Wand2
} from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1, "Please enter a prompt."),
});


export default function PlaygroundPage() {
  const [isPending, startTransition] = useTransition();
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "Explain how AI works in a few words",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      setGeneratedContent("");
      const result = await generateContentAction(values);
      if (result.success && result.text) {
        setGeneratedContent(result.text);
        toast({
          title: "Success!",
          description: `Content generated successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to generate content.",
        });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `Content copied to clipboard.`,
    });
  };
  

  return (
    <div className="min-h-screen w-full dotted-background">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
           <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary">
              AI Playground
            </h1>
             <Link href="/" passHref>
              <Button variant="outline" className="rounded-full">
                <Home className="mr-2" />
                GSite Automator
              </Button>
            </Link>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            A simple interface to experiment with the Genkit AI model.
          </p>
        </header>

        <Card className="max-w-3xl mx-auto shadow-2xl shadow-primary/10 rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 />
              Prompt Zone
            </CardTitle>
            <CardDescription>
              Enter your prompt below to generate content with AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                         Your Prompt
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Explain quantum computing in simple terms."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isPending} className="w-full" size="lg">
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Content
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {generatedContent && (
          <section className="mt-12">
            <h2 className="text-center font-heading text-3xl md:text-4xl font-bold text-primary mb-8">
              Generated Content
            </h2>
            <Card className="shadow-lg max-w-3xl mx-auto rounded-xl">
              <CardHeader>
                <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedContent)}>
                        <ClipboardCopy className="h-5 w-5" />
                        <span className="sr-only">Copy Content</span>
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-primary">
                    {generatedContent}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
