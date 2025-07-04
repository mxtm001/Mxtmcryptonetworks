"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Copy, CheckCircle, AlertTriangle, CreditCard, Building, Bitcoin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CurrencyConverter } from "@/components/currency-converter"

// Crypto addresses for deposits - User's specific addresses
const CRYPTO_ADDRESSES = {
  bitcoin: "1EwSeZbK8RW5EgRc96RnhjcLmGQA6zZ2RV",
  usdt_erc20: "0x4c2bba6f32aa4b804c43dd25c4c3c311dd8016cf",
  usdt_bep20: "0x4c2bba6f32aa4b804c43dd25c4c3c311dd8016cf",
  usdt_trc20: "TFBXLYCcuDLJqkN7ggxzfKMHmW64L7u9AA",
  ethereum: "0x4c2bba6f32aa4b804c43dd25c4c3c311dd8016cf",
}

const CRYPTO_NETWORKS = {
  bitcoin: "Bitcoin Network",
  usdt_erc20: "Ethereum (ERC-20)",
  usdt_bep20: "Binance Smart Chain (BEP-20)",
  usdt_trc20: "Tron (TRC-20)",
  ethereum: "Ethereum Network",
}

const CRYPTO_CONFIRMATIONS = {
  bitcoin: "3",
  usdt_erc20: "12",
  usdt_bep20: "15",
  usdt_trc20: "20",
  ethereum: "12",
}

export default function DepositPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Credit Card Fields
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")

  // Bank Transfer Fields
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [accountName, setAccountName] = useState("")

  useEffect(() => {
    setMounted(true)
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } catch (error) {
      console.error("Error loading user data:", error)
      localStorage.removeItem("user")
      router.push("/login")
    }
  }, [router])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the address manually",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "cryptocurrency" && !selectedCrypto) {
      toast({
        title: "Error",
        description: "Please select a cryptocurrency",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      // Save deposit request
      const deposits = JSON.parse(localStorage.getItem("deposits") || "[]")
      const newDeposit = {
        id: Date.now().toString(),
        userId: user?.email,
        amount: Number.parseFloat(amount),
        paymentMethod,
        cryptocurrency: selectedCrypto,
        status: "pending",
        date: new Date().toISOString(),
        transactionId: `DEP${Date.now()}`,
      }
      deposits.push(newDeposit)
      localStorage.setItem("deposits", JSON.stringify(deposits))

      // Add to transaction history
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      const newTransaction = {
        id: Date.now().toString(),
        userId: user?.email,
        type: "deposit",
        amount: Number.parseFloat(amount),
        status: "pending",
        date: new Date().toISOString(),
        description: `Deposit via ${paymentMethod}`,
        transactionId: `DEP${Date.now()}`,
      }
      transactions.push(newTransaction)
      localStorage.setItem("transactions", JSON.stringify(transactions))

      setIsProcessing(false)
      setShowSuccess(true)
    }, 2000)
  }

  if (!mounted) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#050e24] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a1735] text-white hidden md:block">
        <div className="p-4 border-b border-[#253256]">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image src="/logo.png" alt="MXTM Investment" fill className="object-cover" />
            </div>
            <span className="ml-2 font-medium">MXTM INVESTMENT</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-8">
            <div className="bg-[#162040] h-10 w-10 rounded-full flex items-center justify-center mr-3">
              <span className="text-[#0066ff] font-bold">{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Building className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/deposit" className="flex items-center p-2 rounded-md bg-[#162040] text-white">
                  <Bitcoin className="mr-3 h-5 w-5" />
                  Deposit
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/withdraw"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Bitcoin className="mr-3 h-5 w-5" />
                  Withdraw
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/investments"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Bitcoin className="mr-3 h-5 w-5" />
                  Investments
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/history"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Building className="mr-3 h-5 w-5" />
                  History
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/verification"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Building className="mr-3 h-5 w-5" />
                  Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/support"
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white"
                >
                  <Building className="mr-3 h-5 w-5" />
                  Support
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem("user")
                    router.push("/login")
                  }}
                  className="flex items-center p-2 rounded-md hover:bg-[#162040] text-gray-300 hover:text-white w-full text-left"
                >
                  <Building className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0a1735] z-10 border-b border-[#253256]">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image src="/logo.png" alt="MXTM Investment" fill className="object-cover" />
            </div>
            <span className="ml-2 font-medium text-white text-sm">MXTM</span>
          </Link>
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <Building className="h-5 w-5 text-white" />
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("user")
                router.push("/login")
              }}
            >
              <Building className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="mr-4 text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>
          </div>

          <Card className="bg-[#0a1735] border-[#253256] text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Make a Deposit
              </CardTitle>
              <CardDescription className="text-gray-300">Add funds to your investment account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-[#1a2747] border-[#253256] text-white pl-8"
                      min="10"
                      step="0.01"
                      required
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                  </div>
                  <CurrencyConverter amount={Number.parseFloat(amount) || 0} />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-white">
                    Payment Method
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-[#1a2747] border-[#253256] text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2747] border-[#253256]">
                      <SelectItem value="credit-card" className="text-white">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="bank-transfer" className="text-white">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Bank Transfer
                        </div>
                      </SelectItem>
                      <SelectItem value="cryptocurrency" className="text-white">
                        <div className="flex items-center">
                          <Bitcoin className="h-4 w-4 mr-2" />
                          Cryptocurrency
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Credit Card Fields */}
                {paymentMethod === "credit-card" && (
                  <div className="space-y-4 p-4 bg-[#0f1a2e] rounded-lg border border-[#253256]">
                    <h3 className="text-white font-medium">Credit Card Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="cardNumber" className="text-white">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate" className="text-white">
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-white">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="cardName" className="text-white">
                          Cardholder Name
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Fields */}
                {paymentMethod === "bank-transfer" && (
                  <div className="space-y-4 p-4 bg-[#0f1a2e] rounded-lg border border-[#253256]">
                    <h3 className="text-white font-medium">Bank Transfer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankName" className="text-white">
                          Bank Name
                        </Label>
                        <Input
                          id="bankName"
                          placeholder="Bank of America"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber" className="text-white">
                          Account Number
                        </Label>
                        <Input
                          id="accountNumber"
                          placeholder="1234567890"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="routingNumber" className="text-white">
                          Routing Number
                        </Label>
                        <Input
                          id="routingNumber"
                          placeholder="021000021"
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountName" className="text-white">
                          Account Holder Name
                        </Label>
                        <Input
                          id="accountName"
                          placeholder="John Doe"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="bg-[#1a2747] border-[#253256] text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cryptocurrency Fields */}
                {paymentMethod === "cryptocurrency" && (
                  <div className="space-y-4 p-4 bg-[#0f1a2e] rounded-lg border border-[#253256]">
                    <h3 className="text-white font-medium">Cryptocurrency Deposit</h3>

                    <div className="space-y-2">
                      <Label htmlFor="cryptocurrency" className="text-white">
                        Select Cryptocurrency
                      </Label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger className="bg-[#1a2747] border-[#253256] text-white">
                          <SelectValue placeholder="Choose cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2747] border-[#253256]">
                          {Object.keys(CRYPTO_ADDRESSES).map((key) => (
                            <SelectItem key={key} value={key} className="text-white">
                              {CRYPTO_ADDRESSES[key as keyof typeof CRYPTO_ADDRESSES]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCrypto && (
                      <div className="space-y-4 p-4 bg-[#1a2747] rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">{selectedCrypto} Deposit</h4>
                          <span className="text-sm text-gray-400">
                            Network: {CRYPTO_NETWORKS[selectedCrypto as keyof typeof CRYPTO_NETWORKS]}
                          </span>
                        </div>

                        <Alert className="bg-[#0f1a2e] border-yellow-500">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-200">
                            <strong>Important:</strong> Only send {selectedCrypto} to this address on the{" "}
                            {CRYPTO_NETWORKS[selectedCrypto as keyof typeof CRYPTO_NETWORKS]}. Sending other
                            cryptocurrencies or using wrong networks will result in permanent loss of funds.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label className="text-white">Deposit Address</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={CRYPTO_ADDRESSES[selectedCrypto as keyof typeof CRYPTO_ADDRESSES]}
                              readOnly
                              className="bg-[#0f1a2e] border-[#253256] text-white font-mono text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(CRYPTO_ADDRESSES[selectedCrypto as keyof typeof CRYPTO_ADDRESSES])
                              }
                              className="border-[#253256] text-white hover:bg-[#253256]"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Network:</span>
                            <p className="text-white">
                              {CRYPTO_NETWORKS[selectedCrypto as keyof typeof CRYPTO_NETWORKS]}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Required Confirmations:</span>
                            <p className="text-white">
                              {CRYPTO_CONFIRMATIONS[selectedCrypto as keyof typeof CRYPTO_CONFIRMATIONS]} blocks
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-white font-medium">Deposit Instructions:</h5>
                          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                            <li>Copy the deposit address above</li>
                            <li>Open your crypto wallet or exchange</li>
                            <li>Send {selectedCrypto} to the copied address</li>
                            <li>
                              Wait for {CRYPTO_CONFIRMATIONS[selectedCrypto as keyof typeof CRYPTO_CONFIRMATIONS]}{" "}
                              network confirmations
                            </li>
                            <li>Your balance will be updated automatically</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black font-medium"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Submit Deposit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-[#0a1735] border-[#253256] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-400">
              <CheckCircle className="h-5 w-5 mr-2" />
              Deposit Request Submitted
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Your deposit request has been submitted successfully. You will receive a confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-[#0f1a2e] rounded-lg">
              <h4 className="font-medium text-white mb-2">Next Steps:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Your deposit is being processed</li>
                <li>• Processing time: 1-24 hours</li>
                <li>• You'll receive email confirmation</li>
                <li>• Funds will appear in your balance</li>
              </ul>
            </div>
            <Button
              onClick={() => {
                setShowSuccess(false)
                router.push("/dashboard")
              }}
              className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black"
            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
