
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AppMenu from '@/components/AppMenu';
import { 
  Search, 
  Phone, 
  Plane, 
  FileText, 
  RotateCcw,
  Plus,
  Tag,
  FileArchive,
  Edit,
  Trash,
  Check,
  X
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// More realistic reference library data with tags
const initialReferenceItems = [
  {
    id: 1,
    title: 'Travel Preferences',
    description: 'Preferred airlines, hotel chains, and travel requirements.',
    content: 'For international flights, prefer Star Alliance carriers. For domestic, Southwest or Delta. Prefer Marriott or Hilton for hotels. Always book aisle seats.',
    tags: ['airlines', 'hotels', 'travel policy'],
    icon: Plane,
    hasAttachment: false,
    updatedAt: '2 days ago'
  },
  {
    id: 2,
    title: 'Key Contacts',
    description: 'Important contact information for frequent collaborators.',
    content: 'John Smith (IT): john@example.com, 555-123-4567\nSarah Johnson (HR): sarah@example.com, 555-987-6543\nAlex Brown (Finance): alex@example.com, 555-456-7890',
    tags: ['phone numbers', 'emails', 'employees'],
    icon: Phone,
    hasAttachment: true,
    updatedAt: '5 days ago'
  },
  {
    id: 3,
    title: 'Meeting Preparation SOP',
    description: 'Standard operating procedure for preparing meeting materials.',
    content: '1. Create agenda 48 hours in advance\n2. Share agenda with participants\n3. Prepare slide deck if necessary\n4. Reserve meeting room and test AV equipment\n5. Send calendar invites with agenda attached',
    tags: ['sop', 'meetings', 'preparation'],
    icon: FileText,
    hasAttachment: false,
    updatedAt: '1 week ago'
  },
  {
    id: 4,
    title: 'Expense Reporting Process',
    description: 'Step-by-step guide for submitting and approving expenses.',
    content: 'Collect all receipts. Categorize expenses. Submit through expense portal within 30 days of purchase. Approval workflow: manager → department head → finance.',
    tags: ['expenses', 'reimbursement', 'finance'],
    icon: FileText,
    hasAttachment: true,
    updatedAt: '2 weeks ago'
  },
  {
    id: 5,
    title: 'Conference Room Booking',
    description: 'Instructions for booking conference rooms and AV equipment.',
    content: 'Use the room booking system on the intranet. Book at least 24 hours in advance for small rooms, 48 hours for large conference rooms. For AV equipment, contact IT helpdesk.',
    tags: ['booking', 'conference rooms', 'meetings'],
    icon: FileText, 
    hasAttachment: false,
    updatedAt: '3 weeks ago'
  },
  {
    id: 6,
    title: 'Executive Team Contacts',
    description: 'Contact information for the executive leadership team.',
    content: 'CEO: ceo@example.com, 555-111-2222\nCFO: cfo@example.com, 555-333-4444\nCTO: cto@example.com, 555-555-6666\nCOO: coo@example.com, 555-777-8888',
    tags: ['leadership', 'executives', 'management'],
    icon: Phone,
    hasAttachment: false,
    updatedAt: '1 month ago'
  }
];

const Library = () => {
  const [referenceItems, setReferenceItems] = useState(initialReferenceItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');

  // Form for creating/editing items
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      tags: [],
      newTag: '',
      hasAttachment: false
    }
  });

  // Extract unique tags
  useEffect(() => {
    const tags = new Set<string>();
    
    referenceItems.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    
    setAvailableTags(Array.from(tags));
  }, [referenceItems]);

  // Filter items based on search query and selected tags
  const filteredItems = referenceItems.filter(item => {
    // Search in title, description, and content
    const matchesSearch = (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Reset the form when editing a new item
  const resetForm = (item?: any) => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description,
        content: item.content,
        tags: item.tags,
        newTag: '',
        hasAttachment: item.hasAttachment
      });
    } else {
      form.reset({
        title: '',
        description: '',
        content: '',
        tags: [],
        newTag: '',
        hasAttachment: false
      });
    }
  };

  // Handle opening the edit dialog
  const handleEditItem = (item: any) => {
    setEditingItem(item);
    resetForm(item);
  };

  // Handle opening the new item dialog
  const handleNewItem = () => {
    setEditingItem(null);
    resetForm();
    setIsNewItemDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    // Process the tags
    const processedTags = [...data.tags];
    if (data.newTag && !processedTags.includes(data.newTag)) {
      processedTags.push(data.newTag);
    }
    
    // Create the new item object
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      title: data.title,
      description: data.description,
      content: data.content,
      tags: processedTags,
      icon: FileText, // Default icon
      hasAttachment: data.hasAttachment,
      updatedAt: 'Just now'
    };
    
    if (editingItem) {
      // Update existing item
      setReferenceItems(prevItems => 
        prevItems.map(item => item.id === editingItem.id ? newItem : item)
      );
      toast.success("Item updated successfully");
    } else {
      // Add new item
      setReferenceItems(prevItems => [...prevItems, newItem]);
      toast.success("New item added successfully");
    }
    
    // Close the dialog and reset the form
    setEditingItem(null);
    setIsNewItemDialogOpen(false);
    resetForm();
  };

  // Handle deleting an item
  const handleDeleteItem = (id: number) => {
    setReferenceItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success("Item deleted successfully");
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Handle editing a tag
  const startEditTag = (tag: string) => {
    setEditingTag(tag);
    setNewTagValue(tag);
  };

  // Save edited tag
  const saveEditedTag = () => {
    if (editingTag && newTagValue && newTagValue !== editingTag) {
      // Update the tag in all items
      setReferenceItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          tags: item.tags.map(tag => tag === editingTag ? newTagValue : tag)
        }))
      );
      
      // Update selected tags if needed
      setSelectedTags(prevTags => 
        prevTags.map(tag => tag === editingTag ? newTagValue : tag)
      );
      
      // Update available tags
      setAvailableTags(prevTags => {
        const newTags = prevTags.filter(tag => tag !== editingTag);
        return [...newTags, newTagValue];
      });
      
      toast.success(`Tag updated from "${editingTag}" to "${newTagValue}"`);
    }
    
    // Reset editing state
    setEditingTag(null);
    setNewTagValue('');
  };

  // Cancel tag editing
  const cancelEditTag = () => {
    setEditingTag(null);
    setNewTagValue('');
  };

  // Delete a tag
  const deleteTag = (tagToDelete: string) => {
    // Remove tag from all items
    setReferenceItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        tags: item.tags.filter(tag => tag !== tagToDelete)
      }))
    );
    
    // Remove from selected tags
    setSelectedTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
    
    // Remove from available tags
    setAvailableTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
    
    toast.success(`Tag "${tagToDelete}" deleted`);
  };

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
          <Button className="mt-4 md:mt-0" onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" /> Add New Entry
          </Button>
        </div>

        <AppMenu />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 mt-8">
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
            
            {/* Tags section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2" /> Tags
                </h3>
                {/* Add new tag input */}
                <div className="flex items-center space-x-1">
                  <Input 
                    value={form.watch('newTag') || ''}
                    onChange={(e) => form.setValue('newTag', e.target.value)}
                    placeholder="New tag"
                    className="h-7 text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => {
                      const newTag = form.getValues('newTag');
                      if (newTag && !availableTags.includes(newTag)) {
                        setAvailableTags(prev => [...prev, newTag]);
                        form.setValue('newTag', '');
                        toast.success(`Tag "${newTag}" added`);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <div key={tag} className="flex items-center">
                    {editingTag === tag ? (
                      <div className="flex items-center">
                        <Input
                          value={newTagValue}
                          onChange={(e) => setNewTagValue(e.target.value)}
                          className="h-7 text-xs w-24 mr-1"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={saveEditedTag}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={cancelEditTag}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge 
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="text-xs py-1 px-2 cursor-pointer flex items-center gap-1"
                      >
                        <span onClick={() => toggleTag(tag)}>{tag}</span>
                        <div className="flex items-center ml-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-4 w-4 p-0"
                            onClick={() => startEditTag(tag)}
                          >
                            <Edit className="h-2 w-2" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-4 w-4 p-0 text-destructive"
                            onClick={() => deleteTag(tag)}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </div>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Last updated: Today</span>
            </div>
          </div>
          
          {/* Main content area */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Icon className="h-5 w-5 text-primary" />
                            {item.hasAttachment && (
                              <span className="absolute top-3 right-3">
                                <FileArchive className="h-4 w-4 text-muted-foreground" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.updatedAt}
                          </div>
                        </div>
                        <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-2">{item.description}</CardDescription>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-3 flex justify-between">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View Details</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{item.title}</DialogTitle>
                              <DialogDescription>{item.description}</DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
                                {item.content}
                              </div>
                              {item.hasAttachment && (
                                <div className="flex items-center">
                                  <FileArchive className="h-5 w-5 mr-2 text-muted-foreground" />
                                  <span className="text-sm">Attachment available</span>
                                </div>
                              )}
                            </div>
                            <DialogFooter className="flex justify-end mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit Entry
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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

      {/* Dialog for adding/editing items */}
      <Dialog 
        open={isNewItemDialogOpen || !!editingItem} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setIsNewItemDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Update this entry in the reference library.' 
                : 'Create a new entry for the reference library.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed information..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={field.value?.includes(tag) ? "default" : "outline"}
                          className="text-xs py-1 px-2 cursor-pointer"
                          onClick={() => {
                            const currentTags = field.value || [];
                            if (currentTags.includes(tag)) {
                              field.onChange(currentTags.filter(t => t !== tag));
                            } else {
                              field.onChange([...currentTags, tag]);
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Add a new tag"
                        value={form.watch('newTag') || ''}
                        onChange={(e) => form.setValue('newTag', e.target.value)}
                        className="text-sm"
                      />
                      <Button 
                        type="button" 
                        onClick={() => {
                          const newTag = form.getValues('newTag');
                          if (newTag) {
                            // Add to current item's tags
                            const currentTags = form.getValues('tags') || [];
                            if (!currentTags.includes(newTag)) {
                              form.setValue('tags', [...currentTags, newTag]);
                            }
                            
                            // Add to available tags if not already there
                            if (!availableTags.includes(newTag)) {
                              setAvailableTags(prev => [...prev, newTag]);
                            }
                            
                            form.setValue('newTag', '');
                          }
                        }}
                      >
                        Add Tag
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasAttachment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>This entry has attachments</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {editingItem ? 'Update Entry' : 'Add Entry'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Library;
