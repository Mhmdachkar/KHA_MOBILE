import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const TechBlog = () => {
  const articles = [
    {
      id: 1,
      title: "Top 10 Smartphones of 2025",
      excerpt: "Comprehensive review of the year's flagship devices with detailed performance benchmarks.",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
      category: "Reviews",
      readTime: "8 min read",
      date: "Jan 15, 2025"
    },
    {
      id: 2,
      title: "Ultimate Gaming Laptop Buyer's Guide",
      excerpt: "Everything you need to know before purchasing your next gaming machine.",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop",
      category: "Buying Guides",
      readTime: "12 min read",
      date: "Jan 12, 2025"
    },
    {
      id: 3,
      title: "AirPods Pro vs Sony WH-1000XM5",
      excerpt: "Head-to-head comparison of the industry's leading noise-canceling headphones.",
      image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&h=500&fit=crop",
      category: "Comparisons",
      readTime: "6 min read",
      date: "Jan 10, 2025"
    }
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.05 }}
        viewport={{ once: true }}
        className="absolute inset-0 bg-gradient-to-br from-primary to-accent"
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 animate-bounce-in">
            <BookOpen className="h-3 w-3 mr-1" />
            Latest Tech Insights
          </Badge>
          <h2 className="text-elegant text-4xl mb-4">Tech News & Guides</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Stay informed with expert reviews, buying guides, and in-depth product comparisons
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full">
                <div className="relative overflow-hidden">
                  <motion.img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="shadow-lg">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-elegant text-xl group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 text-xs">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 font-light">
                    {article.excerpt}
                  </p>
                  <Button variant="ghost" className="group-hover:text-primary transition-colors p-0">
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="text-elegant">
            View All Articles
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TechBlog;
