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
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
} from "lucide-react";

const formSchema = z.object({
  primaryKeywords: z.string().min(1, "Please enter at least one primary keyword."),
  secondaryKeywords: z.string().min(1, "Please enter at least one secondary keyword."),
  cy: z.string().min(1, "Please enter a CY value."),
  chosenLink: z.string().min(1, "Please provide a link."),
});

type Article = {
  title: string;
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

  const copyToClipboardFallback = (text: string, type: 'Title' | 'Content') => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (err) {
      console.error(`Failed to copy ${type}:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to copy ${type}.`,
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };
  
  const copyTitle = (title: string) => {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(title).then(() => {
             toast({
                title: "Copied!",
                description: "Title copied to clipboard.",
            });
        }, (err) => {
            console.error("Failed to copy title: ", err);
            copyToClipboardFallback(title, "Title");
        });
    } else {
        copyToClipboardFallback(title, "Title");
    }
  };

  const copyHtmlContent = (htmlContent: string) => {
    const listener = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      e.clipboardData.setData('text/html', htmlContent);
      e.clipboardData.setData('text/plain', htmlContent);
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
    toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
    });
  };
  
  const downloadArticleAsTxt = (article: Article) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const textToDownload = `${article.title}\n\n${plainText.trim()}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary">
              GSite Automator
            </h1>
            <Link href="/playground" passHref>
              <Button variant="outline">
                <Beaker className="mr-2" />
                Playground
              </Button>
            </Link>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            AI-Powered Google Site Article Generator
          </p>
        </header>

        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText />
              Content Generation Engine
            </CardTitle>
            <CardDescription>
              Fill in the details below to generate your articles.
            </CardDescription>
          </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Preset Primary Keywords</FormLabel>
                    <KeywordSuggester />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetKeywords.map(kw => (
                       <Button key={kw} type="button" size="sm" variant="outline" onClick={() => addPresetKeyword(kw)}>
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
                      <FormLabel className="flex items-center gap-2">
                        <Key className="h-4 w-4" /> Primary Keywords
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 黑料不打烊, 今日黑料
Separated by commas or new lines."
                          {...field}
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
                      <FormLabel className="flex items-center gap-2">
                        <Tags className="h-4 w-4" /> Secondary Keywords
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 最新事件, 曝光揭秘, 黑料大全
Separated by commas or new lines."
                          {...field}
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
                        <FormLabel className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" /> CY Value
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
                        <FormLabel className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" /> Domain Link
                        </FormLabel>
                         <div className="flex flex-wrap gap-2 mb-2">
                           {presetLinks.map(link => (
                             <Button key={link} type="button" size="sm" variant="outline" onClick={() => form.setValue("chosenLink", link, { shouldValidate: true })}>
                              {link}
                             </Button>
                           ))}
                         </div>
                        <FormControl>
                          <Input placeholder="e.g., 183.run" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <CardFooter className="px-0 pt-6">
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Articles
                  </Button>
                </CardFooter>
              </form>
            </Form>
        </Card>

        {articles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-center font-headline text-3xl md:text-4xl font-bold text-primary mb-8">
              Generated Articles
            </h2>
            <div className="space-y-4">
              {articles.map((article, index) => (
                <Card key={index} className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                       <CardTitle className="text-lg flex-1">
                        {index + 1}. {article.title}
                       </CardTitle>
                      <div className="flex flex-col sm:flex-row gap-2 items-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTitle(article.title)}
                        >
                          <ClipboardCopy className="mr-2 h-4 w-4" />
                          Copy Title
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyHtmlContent(article.content)}
                        >
                          <ClipboardCopy className="mr-2 h-4 w-4" />
                          Copy Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadArticleAsTxt(article)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
