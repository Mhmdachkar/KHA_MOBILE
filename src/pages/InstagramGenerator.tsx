import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Instagram, FileText, Grid3x3, Image as ImageIcon, Copy, Check } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  phoneAccessories,
  wearablesProducts,
  smartphoneProducts,
  tabletProducts,
  iphoneCases,
  gamingConsoles,
  getProductsByCategory,
} from "@/data/products";
import { greenLionProducts } from "@/data/greenLionProducts";

interface Product {
  id: number;
  name: string;
  title?: string;
  price: number;
  image: string;
  images?: string[];
  rating: number;
  category: string;
  brand?: string;
  description?: string;
  features?: string[];
  isPreorder?: boolean;
}

interface InstagramPost {
  id: string;
  product: Product;
  caption: string;
  hashtags: string;
  storyText: string;
  date: string;
}

const InstagramGenerator = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [includeStories, setIncludeStories] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem("instagram_generator_auth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  // Get all products including Green Lion - MUST be called before any conditional returns
  const allProducts = useMemo(() => {
    const getDisplayPrice = (product: any): number => {
      if (product.variants && product.variants.length > 0) {
        return product.variants[0].price;
      }
      return product.price;
    };

    const regularProducts: Product[] = [
      ...phoneAccessories.map(p => ({
        id: p.id,
        name: p.name,
        title: p.title,
        price: getDisplayPrice(p),
        image: p.image,
        images: p.images || [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        description: p.description,
        features: p.features,
        isPreorder: p.isPreorder,
      })),
      ...wearablesProducts.map(p => ({
        id: p.id,
        name: p.name,
        title: p.title,
        price: getDisplayPrice(p),
        image: p.image,
        images: p.images || [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        description: p.description,
        features: p.features,
        isPreorder: p.isPreorder,
      })),
      ...smartphoneProducts.map(p => ({
        id: p.id,
        name: p.name,
        title: p.title,
        price: getDisplayPrice(p),
        image: p.image,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        description: p.description,
        features: p.features,
        isPreorder: p.isPreorder,
      })),
      ...tabletProducts.map(p => ({
        id: p.id,
        name: p.name,
        title: p.title,
        price: getDisplayPrice(p),
        image: p.image,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        description: p.description,
        features: p.features,
        isPreorder: p.isPreorder,
      })),
      ...iphoneCases.map(p => ({
        id: p.id,
        name: p.name,
        title: p.title,
        price: getDisplayPrice(p),
        image: p.image,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        description: p.description,
        features: p.features,
        isPreorder: p.isPreorder,
      })),
      ...gamingConsoles.map(p => ({
        id: p.id,
        name: p.name,
        title: p.title,
        price: getDisplayPrice(p),
        image: p.image,
        images: p.images && p.images.length > 0 ? p.images : [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        description: p.description,
        features: p.features,
        isPreorder: p.isPreorder,
      })),
    ];

    const greenLionProductsList: Product[] = greenLionProducts.map(p => ({
      id: p.id,
      name: p.name,
      title: p.title,
      price: getDisplayPrice(p),
      image: p.images[0],
      images: p.images,
      rating: p.rating,
      category: p.category,
      brand: p.brand,
      description: p.description,
      features: p.features,
      isPreorder: p.isPreorder,
    }));

    // Filter out products with invalid data, but keep price 0 items (preorder)
    return [...regularProducts, ...greenLionProductsList].filter(
      p => p.name && p.image && (p.price >= 0)
    );
  }, []);

  // Generate product caption
  const generateCaption = (product: Product): string => {
    const brand = product.brand || "Premium";
    const price = product.price > 0 ? product.price.toFixed(2) : "Contact for Price";
    const rating = product.rating.toFixed(1);
    const preorder = product.isPreorder || product.price === 0 ? "📦 PREORDER NOW" : "🛒 SHOP NOW";
    
    let caption = `✨ ${product.name}\n\n`;
    
    if (product.description) {
      const shortDesc = product.description.length > 150 
        ? product.description.substring(0, 150) + "..."
        : product.description;
      caption += `${shortDesc}\n\n`;
    }
    
    if (product.features && product.features.length > 0) {
      caption += `🌟 Key Features:\n`;
      product.features.slice(0, 3).forEach(feature => {
        const cleanFeature = feature.split(':')[0].trim();
        caption += `• ${cleanFeature}\n`;
      });
      caption += `\n`;
    }
    
    caption += `⭐ ${rating}/5 Rating\n`;
    if (product.price > 0) {
      caption += `💰 $${price}\n\n`;
    } else {
      caption += `💰 ${price}\n\n`;
    }
    caption += `${preorder}\n`;
    caption += `Link in bio! 👆\n\n`;
    
    return caption;
  };

  // Generate hashtags
  const generateHashtags = (product: Product): string => {
    const category = product.category.toLowerCase().replace(/\s+/g, '');
    const brand = product.brand?.toLowerCase().replace(/\s+/g, '') || '';
    const nameWords = product.name.toLowerCase().split(' ').slice(0, 3);
    
    const hashtags = [
      `#${category}`,
      brand ? `#${brand}` : '',
      ...nameWords.map(w => `#${w.replace(/[^a-z0-9]/g, '')}`),
      '#tech',
      '#gadgets',
      '#electronics',
      '#shopnow',
      '#onlineshopping',
      '#deals',
      '#techlover',
      '#gadgetlover',
      '#musthave',
      '#newarrival',
    ].filter(Boolean).join(' ');
    
    return hashtags;
  };

  // Generate story text
  const generateStoryText = (product: Product): string => {
    const price = product.price > 0 ? `$${product.price.toFixed(2)}` : "Contact for Price";
    const brand = product.brand || "Premium";
    const action = product.isPreorder || product.price === 0 ? "📦 Preorder Now!" : "🛒 Shop Now!";
    
    return `🔥 NEW ARRIVAL 🔥\n\n${product.name}\n\n💰 ${price}\n\n✨ ${brand}\n\n${action}\n\nLink in bio 👆`;
  };

  // Generate Instagram posts
  const generatePosts = (): InstagramPost[] => {
    const productsToUse = selectedProducts.length > 0 
      ? selectedProducts 
      : allProducts.slice(0, postsPerDay * 7); // 7 days worth
    
    const posts: InstagramPost[] = [];
    const today = new Date();
    
    productsToUse.forEach((product, index) => {
      const dayIndex = Math.floor(index / postsPerDay);
      const postDate = new Date(today);
      postDate.setDate(today.getDate() + dayIndex);
      
      const dateStr = postDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      posts.push({
        id: `post-${product.id}-${index}`,
        product,
        caption: generateCaption(product),
        hashtags: generateHashtags(product),
        storyText: generateStoryText(product),
        date: dateStr,
      });
    });
    
    return posts;
  };

  const posts = useMemo(() => generatePosts(), [selectedProducts, postsPerDay, allProducts]);

  // Group posts by day
  const postsByDay = useMemo(() => {
    const grouped: { [key: string]: InstagramPost[] } = {};
    posts.forEach(post => {
      if (!grouped[post.date]) {
        grouped[post.date] = [];
      }
      grouped[post.date].push(post);
    });
    return grouped;
  }, [posts]);

  // Copy to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  // Download image
  const downloadImage = async (imageUrl: string, productName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Clean product name for filename
      const cleanName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${cleanName}_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Downloaded!",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export all posts as text
  const exportAllPosts = () => {
    let text = "INSTAGRAM POSTS SCHEDULE\n";
    text += "=".repeat(50) + "\n\n";
    
    Object.entries(postsByDay).forEach(([date, dayPosts]) => {
      text += `📅 ${date}\n`;
      text += "-".repeat(50) + "\n\n";
      
      dayPosts.forEach((post, idx) => {
        text += `POST ${idx + 1}\n\n`;
        text += `Product: ${post.product.name}\n`;
        text += `Price: $${post.product.price.toFixed(2)}\n`;
        text += `Category: ${post.product.category}\n\n`;
        text += `CAPTION:\n${post.caption}\n\n`;
        text += `HASHTAGS:\n${post.hashtags}\n\n`;
        
        if (includeStories) {
          text += `STORY TEXT:\n${post.storyText}\n\n`;
        }
        
        text += "=".repeat(50) + "\n\n";
      });
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-posts-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported!",
      description: "All posts exported as text file",
    });
  };

  // Select random products
  const selectRandomProducts = () => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    setSelectedProducts(shuffled.slice(0, postsPerDay * 7));
    toast({
      title: "Products Selected",
      description: `Selected ${postsPerDay * 7} random products`,
    });
  };

  // Select products by category
  const selectByCategory = (category: string) => {
    const categoryProducts = allProducts.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
    setSelectedProducts(categoryProducts.slice(0, postsPerDay * 7));
    toast({
      title: "Products Selected",
      description: `Selected ${categoryProducts.length} products from ${category}`,
    });
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allProducts.map(p => p.category)));
    return unique.sort();
  }, [allProducts]);

  // Handle password authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password protection - change this to your desired password
    const correctPassword = "admin2024"; // Change this to your preferred password
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("instagram_generator_auth", "authenticated");
      toast({
        title: "Access Granted",
        description: "Welcome to Instagram Generator",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  // Password protection screen - render this if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-6 w-6 text-pink-600" />
              Instagram Generator
            </CardTitle>
            <CardDescription>
              This is an internal admin tool. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Access Generator
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content - only rendered if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Instagram className="h-8 w-8 text-pink-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Instagram Post Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Generate professional Instagram posts and stories for your products
          </p>
        </motion.div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Post Settings</CardTitle>
            <CardDescription>Configure your Instagram posting schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Posts Per Day</label>
                <select
                  value={postsPerDay}
                  onChange={(e) => setPostsPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={1}>1 Post</option>
                  <option value={2}>2 Posts</option>
                  <option value={3}>3 Posts</option>
                  <option value={4}>4 Posts</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Select</label>
                <Button onClick={selectRandomProducts} variant="outline" className="w-full">
                  Select Random Products
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Export All</label>
                <Button onClick={exportAllPosts} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Posts
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Select by Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    onClick={() => selectByCategory(category)}
                    variant="outline"
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeStories"
                checked={includeStories}
                onChange={(e) => setIncludeStories(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="includeStories" className="text-sm">
                Include Story Posts
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="list">
              <FileText className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-8">
            {Object.entries(postsByDay).map(([date, dayPosts]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    {date}
                  </CardTitle>
                  <CardDescription>
                    {dayPosts.length} {dayPosts.length === 1 ? 'post' : 'posts'} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dayPosts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-4"
                      >
                        {/* Post Preview */}
                        <Card className="overflow-hidden border-2 border-pink-200">
                          <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 relative group">
                            <img
                              src={post.product.image}
                              alt={post.product.name}
                              className="w-full h-full object-contain p-4"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-white/90">
                                ${post.product.price.toFixed(2)}
                              </Badge>
                            </div>
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white/90 hover:bg-white shadow-md"
                                onClick={() => downloadImage(post.product.image, post.product.name)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                              {post.product.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                              {post.product.category}
                            </p>
                            
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full text-xs"
                                onClick={() => downloadImage(post.product.image, post.product.name)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download Image
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => copyToClipboard(post.caption + '\n\n' + post.hashtags, idx)}
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Caption
                                  </>
                                )}
                              </Button>
                              
                              {includeStories && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs"
                                  onClick={() => copyToClipboard(post.storyText, idx + 1000)}
                                >
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  Copy Story
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {posts.map((post, index) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{post.product.name}</CardTitle>
                      <CardDescription>
                        {post.date} • {post.product.category} • ${post.product.price.toFixed(2)}
                      </CardDescription>
                    </div>
                    <div className="relative group">
                      <img
                        src={post.product.image}
                        alt={post.product.name}
                        className="w-20 h-20 object-contain rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md text-xs"
                        onClick={() => downloadImage(post.product.image, post.product.name)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => downloadImage(post.product.image, post.product.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Caption:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {post.caption}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => copyToClipboard(post.caption, index)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Caption
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Hashtags:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      {post.hashtags}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => copyToClipboard(post.hashtags, index + 2000)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Hashtags
                    </Button>
                  </div>
                  
                  {includeStories && (
                    <div>
                      <h4 className="font-semibold mb-2">Story Text:</h4>
                      <div className="bg-pink-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                        {post.storyText}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => copyToClipboard(post.storyText, index + 3000)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Story
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Product Count Info */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p className="text-lg font-semibold mb-2">
                Total Products Available: {allProducts.length}
              </p>
              <p className="text-sm">
                Posts Generated: {posts.length} • Days Covered: {Object.keys(postsByDay).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramGenerator;

