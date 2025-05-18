"use client"

import { useChat } from "ai/react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, RefreshCw, BarChart2, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Chatbot() {
  const [refreshingData, setRefreshingData] = useState(false)
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({ api: "/api/chat" })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleRefreshData = async () => {
    setRefreshingData(true)
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: "Refresh data cache" }],
          forceRefresh: true,
        }),
      })
      if (messages.length > 0) reload()
    } catch (e) {
      console.error("Error refreshing data:", e)
    } finally {
      setRefreshingData(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (inputRef.current) {
      inputRef.current.value = suggestion
      handleInputChange({ target: { value: suggestion } } as any)
      setTimeout(() => {
        handleSubmit(new Event("submit") as any)
      }, 100)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Liquid Staking Insight Agent</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-accent"
            onClick={handleRefreshData}
            disabled={refreshingData}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshingData && "animate-spin")} />
            Refresh Data
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Chat Window */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-2xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center">
              <Bot className="h-16 w-16 mb-6 text-primary opacity-80" />
              <h2 className="text-2xl font-medium mb-4">Welcome to Liquid Staking Insight Agent</h2>
              <p className="max-w-md text-muted-foreground mb-8 text-lg">
                Ask me about liquid staking protocols like Lido, Rocket Pool, or Bifrost. I can provide APY comparisons,
                TVL data, and performance insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                {[
                  "Which LST has the highest APY right now?",
                  "Compare Lido vs Rocket Pool",
                  "Which protocol has the most TVL?",
                  "What's the best yield opportunities on bifrost?",
                ].map((text, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start text-left p-4 h-auto w-full break-words whitespace-normal"
                    onClick={() => handleSuggestionClick(text)}
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("mb-6", msg.role === "user" ? "text-foreground" : "text-muted-foreground")}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "rounded-full p-2 flex-shrink-0 mt-1",
                        msg.role === "user" ? "bg-blue-600" : "bg-primary",
                      )}
                    >
                      {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 overflow-hidden prose prose-invert max-w-none">
                      {msg.role === "user" ? (
                        <p className="text-base">{msg.content}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                            p: ({ ...props }) => <p className="mb-4 text-base" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                            li: ({ ...props }) => <li className="mb-1" {...props} />,
                            a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
                            blockquote: ({ ...props }) => (
                              <blockquote className="border-l-4 border-border pl-4 italic my-4" {...props} />
                            ),
                            code: ({ inline, ...props }) =>
                              inline ? (
                                <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props} />
                              ) : (
                                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto my-4">
                                  <code {...props} />
                                </pre>
                              ),
                            table: ({ ...props }) => (
                              <div className="my-6 border border-border rounded-md overflow-hidden">
                                <table className="min-w-full border-collapse" {...props} />
                              </div>
                            ),
                            thead: ({ ...props }) => <thead className="bg-muted" {...props} />,
                            tbody: ({ ...props }) => <tbody className="divide-y divide-border" {...props} />,
                            tr: ({ ...props }) => <tr className="border-b last:border-0" {...props} />,
                            th: ({ ...props }) => (
                              <th
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground border-r border-border last:border-0"
                                {...props}
                              />
                            ),
                            td: ({ ...props }) => (
                              <td className="px-6 py-4 text-sm border-r border-border last:border-0" {...props} />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 mb-6">
                  <div className="rounded-full p-2 mt-1 bg-primary">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  </div>
                  <p className="text-muted-foreground">Analyzing data...</p>
                </div>
              )}
              {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive mb-6">
                  Error: {error.message}
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input */}
      <footer>
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about liquid staking protocols..."
              className="flex-1 text-base py-6"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </footer>
    </div>
  )
}
