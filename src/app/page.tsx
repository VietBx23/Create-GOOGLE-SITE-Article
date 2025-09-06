"use client";

import * as React from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateArticles, suggestArticleKeywords } from "./actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileText,
  Key,
  Tags,
  CalendarDays,
  Link as LinkIcon,
  Sparkles,
  ClipboardCopy,
  Loader2,
  Copy,
  Beaker,
  Download,
  ChevronRight,
  Home
} from "lucide-react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";

const formSchema = z.object({
  primaryKeywords: z.string().min(1, "Please enter at least one primary keyword."),
  secondaryKeywords: z.string().min(1, "Please enter at least one secondary keyword."),
  cy: z.string().min(1, "Please enter a CY value."),
  chosenLink: z.string().min(1, "Please provide a domain link."),
});

type Article = {
  plainTitle: string;
  titleWithLink: string;
  content: string;
};

const KeywordSuggester = () => {
  const [topic, setTopic] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isSuggesting, startSuggestion] = useTransition();
  const { toast } = useToast();

  const handleSuggest = () => {
    if (!topic) return;
    startSuggestion(async () => {
      const result = await suggestArticleKeywords(topic);
      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to get keyword suggestions.",
        });
      }
    });
  };
  
  const copyToClipboardFallback = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      toast({
        title: "Copied!",
        description: "Suggestions copied to clipboard.",
      });
    } catch (err) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy suggestions.",
      });
    }
    document.body.removeChild(textArea);
  }


  const copySuggestions = () => {
    if (suggestions.length === 0) return;
    const textToCopy = suggestions.join(", ");
    if (!navigator.clipboard) {
      copyToClipboardFallback(textToCopy);
      return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied!",
        description: "Keyword suggestions copied to clipboard.",
      });
    }, (err) => {
       console.error("Failed to copy suggestions: ", err);
       copyToClipboardFallback(textToCopy);
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Keyword Suggester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Keyword Suggester</DialogTitle>
          <DialogDescription>
            Enter a topic to get AI-powered keyword suggestions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 'Digital Marketing Trends'"
            />
          </div>
          <Button onClick={handleSuggest} disabled={isSuggesting || !topic}>
            {isSuggesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Suggest Keywords
          </Button>
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Suggestions:</h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <Badge key={i} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={copySuggestions} className="mt-2">
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function GSiteAutomatorPage() {
  const [isPending, startTransition] = useTransition();
  const [articles, setArticles] = React.useState<Article[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryKeywords: "",
      secondaryKeywords: "",
      cy: "",
      chosenLink: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await generateArticles(values);
      if (result.success && result.results) {
        setArticles(result.results);
        toast({
          title: "Success!",
          description: `Generated ${result.results.length} articles.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to generate articles.",
        });
      }
    });
  };
  
  const presetLinks = ["183.run", "uu1.run", "uu2.run", "uu3.run", "za51.run", "za52.run", "za53.run"];
  const presetKeywords = ["黑料网"];

  const addPresetKeyword = (keyword: string) => {
    const current = form.getValues("primaryKeywords");
    const keywords = current ? current.split(/[,\n]/).map(k => k.trim()) : [];
    if (!keywords.includes(keyword)) {
      form.setValue("primaryKeywords", current ? `${current}, ${keyword}` : keyword);
    }
  };
  
  const copyHtmlContent = (htmlContent: string) => {
    const listener = (e: ClipboardEvent) => {
      e.clipboardData?.setData('text/html', htmlContent);
      e.clipboardData?.setData('text/plain', htmlContent);
      e.preventDefault();
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard as HTML.",
    });
  };
  
  const downloadArticleAsTxt = (article: Article) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const textToDownload = `${article.plainTitle}\n\n${plainText.trim()}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.plainTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="dotted-background">
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              G
            </div>
            <span className="font-semibold text-lg">GSite Automator</span>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>
              <Home />
              GSite Automator
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Link href="/playground" passHref>
                <SidebarMenuButton>
                  <Beaker />
                  Playground
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 md:p-8 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            <header className="mb-12">
              <h1 className="font-heading text-4xl font-bold text-foreground">
                GSite Automator
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Your AI-Powered Content Engine for Google Sites. Effortlessly generate keyword-rich articles from a simple form.
              </p>
            </header>

            <Card className="shadow-lg rounded-2xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="p-6">
                    <div className="space-y-8">
                       <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="font-semibold text-base">Preset Primary Keywords</Label>
                          <KeywordSuggester />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {presetKeywords.map(kw => (
                            <Button key={kw} type="button" size="sm" variant="outline" className="rounded-full" onClick={() => addPresetKeyword(kw)}>
                              {kw}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="primaryKeywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 font-semibold text-base">
                              <Key className="h-5 w-5 text-primary" /> Primary Keywords
                            </FormLabel>
                            <FormDescription>Keywords that will be reused across multiple articles.</FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., keyword one, keyword two"
                                {...field}
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondaryKeywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 font-semibold text-base">
                              <Tags className="h-5 w-5 text-primary" /> Secondary Keywords
                            </FormLabel>
                            <FormDescription>Each keyword will be used to generate a unique article.</FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., keyword three, keyword four"
                                {...field}
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="cy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 font-semibold text-base">
                                <CalendarDays className="h-5 w-5 text-primary" /> CY Value
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2025" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="chosenLink"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 font-semibold text-base">
                                <LinkIcon className="h-5 w-5 text-primary" /> Domain Link
                              </FormLabel>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {presetLinks.map(link => (
                                  <Button key={link} type="button" size="sm" variant="outline" className="rounded-full" onClick={() => form.setValue("chosenLink", link, { shouldValidate: true })}>
                                    {link}
                                  </Button>
                                ))}
                              </div>
                              <FormControl>
                                <Input placeholder="e.g., example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-6 rounded-b-2xl">
                    <Button type="submit" disabled={isPending} size="lg" className="w-full font-bold">
                      {isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-5 w-5" />
                      )}
                      Generate Articles
                      <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            {articles.length > 0 && (
              <section className="mt-16 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <div className="mb-8">
                    <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                    Generated Articles
                    </h2>
                    <p className="text-muted-foreground">Found {articles.length} articles. Ready to copy or download.</p>
                </div>
                <div className="space-y-4">
                  {articles.map((article, index) => (
                    <Card key={index} className="shadow-md overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl">
                      <CardHeader className="flex flex-row justify-between items-start gap-4 p-4 bg-muted/30">
                        <CardTitle className="text-base font-medium flex-1">
                          <span className="font-bold text-primary mr-2">{index + 1}.</span> {article.plainTitle}
                        </CardTitle>
                        <div className="flex flex-shrink-0 flex-row gap-2 items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyHtmlContent(article.titleWithLink)}
                          >
                            <ClipboardCopy className="mr-2 h-4 w-4" />
                            Title
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyHtmlContent(article.content)}
                          >
                            <ClipboardCopy className="mr-2 h-4 w-4" />
                            Content
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadArticleAsTxt(article)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
        </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
