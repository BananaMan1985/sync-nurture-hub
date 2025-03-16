
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Search, 
  Filter, 
  Phone, 
  Plane, 
  FileText, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample reference library data
const referenceItems = [
  {
    id: 1,
    title: 'Travel Preferences',
    description: 'Preferred airlines, hotel chains, and travel requirements.',
    category: 'travel',
    icon: Plane,
    updatedAt: '2 days ago'
  },
  {
    id: 2,
    title: 'Key Contacts',
    description: 'Important contact information for frequent collaborators.',
    category: 'contacts',
    icon: Phone,
    updatedAt: '5 days ago'
  },
  {
    id: 3,
    title: 'Meeting Preparation SOP',
    description: 'Standard operating procedure for preparing meeting materials.',
    category: 'processes',
    icon: FileText,
    updatedAt: '1 week ago'
  },
  {
    id: 4,
    title: 'Expense Reporting Process',
    description: 'Step-by-step guide for submitting and approving expenses.',
    category: 'processes',
    icon: FileText,
    updatedAt: '2 weeks ago'
  },
  {
    id: 5,
    title: 'Conference Room Booking',
    description: 'Instructions for booking conference rooms and AV equipment.',
    category: 'processes',
    icon: FileText, 
    updatedAt: '3 weeks ago'
  },
  {
    id: 6,
    title: 'Executive Team Contacts',
    description: 'Contact information for the executive leadership team.',
    category: 'contacts',
    icon: Phone,
    updatedAt: '1 month ago'
  }
];

const Library = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter items based on search query and active tab
  const filteredItems = referenceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 md:px-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reference Library</h1>
            <p className="text-muted-foreground mt-1">
              Access and manage shared knowledge, processes, and contacts
            </p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" /> Add New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
          {/* Sidebar with search and filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="processes">Processes</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="travel">Travel</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Last updated: Today</span>
            </div>
          </div>
          
          {/* Main content area */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.updatedAt}
                          </div>
                        </div>
                        <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{item.description}</CardDescription>
                      </CardContent>
                      <CardFooter className="pt-0 pb-3">
                        <Button variant="ghost" size="sm" className="ml-auto">View Details</Button>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-medium">No results found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Library;
