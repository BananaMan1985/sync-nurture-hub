import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
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
  X,
  Download,
  Image as ImageIcon,
  Table as TableIcon,
  Type as TypeIcon
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ReferenceAttachment } from '@/components/projects/types';

const mockAttachments: ReferenceAttachment[] = [
  {
    id: 'att1',
    name: 'employee_handbook.pdf',
    size: 2500000,
    type: 'application/pdf',
    url: 'https://example.com/files/handbook.pdf'
  },
  {
    id: 'att2',
    name: 'conference_schedule.docx',
    size: 450000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: 'https://example.com/files/schedule.docx'
  },
  {
    id: 'att3',
    name: 'office_map.png',
    size: 1200000,
    type: 'image/png',
    url: 'https://source.unsplash.com/random/800x600/?map'
  }
];

type ReferenceItemType = 'text' | 'image' | 'file' | 'database';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ReferenceItem {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string[];
  icon: React.ElementType;
  attachments: ReferenceAttachment[];
  updatedAt: string;
  type: ReferenceItemType;
  imageUrl?: string;
  tableData?: TableData;
}

const initialReferenceItems: ReferenceItem[] = [
  {
    id: 1,
    title: 'Travel Preferences',
    description: 'Preferred airlines, hotel chains, and travel requirements.',
    content: 'For international flights, prefer Star Alliance carriers. For domestic, Southwest or Delta. Prefer Marriott or Hilton for hotels. Always book aisle seats.',
    tags: ['airlines', 'hotels', 'travel policy'],
    icon: Plane,
    attachments: [],
    updatedAt: '2 days ago',
    type: 'text'
  },
  {
    id: 2,
    title: 'Key Contacts',
    description: 'Important contact information for frequent collaborators.',
    content: 'John Smith (IT): john@example.com, 555-123-4567\nSarah Johnson (HR): sarah@example.com, 555-987-6543\nAlex Brown (Finance): alex@example.com, 555-456-7890',
    tags: ['phone numbers', 'emails', 'employees'],
    icon: Phone,
    attachments: [mockAttachments[0]],
    updatedAt: '5 days ago',
    type: 'text'
  },
  {
    id: 3,
    title: 'Meeting Preparation SOP',
    description: 'Standard operating procedure for preparing meeting materials.',
    content: '1. Create agenda 48 hours in advance\n2. Share agenda with participants\n3. Prepare slide deck if necessary\n4. Reserve meeting room and test AV equipment\n5. Send calendar invites with agenda attached',
    tags: ['sop', 'meetings', 'preparation'],
    icon: FileText,
    attachments: [],
    updatedAt: '1 week ago',
    type: 'text'
  },
  {
    id: 4,
    title: 'Expense Reporting Process',
    description: 'Step-by-step guide for submitting and approving expenses.',
    content: 'Collect all receipts. Categorize expenses. Submit through expense portal within 30 days of purchase. Approval workflow: manager → department head → finance.',
    tags: ['expenses', 'reimbursement', 'finance'],
    icon: FileText,
    attachments: [mockAttachments[1], mockAttachments[2]],
    updatedAt: '2 weeks ago',
    type: 'text'
  },
  {
    id: 5,
    title: 'Conference Room Booking',
    description: 'Instructions for booking conference rooms and AV equipment.',
    content: 'Use the room booking system on the intranet. Book at least 24 hours in advance for small rooms, 48 hours for large conference rooms. For AV equipment, contact IT helpdesk.',
    tags: ['booking', 'conference rooms', 'meetings'],
    icon: FileText, 
    attachments: [],
    updatedAt: '3 weeks ago',
    type: 'text'
  },
  {
    id: 6,
    title: 'Executive Team Contacts',
    description: 'Contact information for the executive leadership team.',
    content: 'CEO: ceo@example.com, 555-111-2222\nCFO: cfo@example.com, 555-333-4444\nCTO: cto@example.com, 555-555-6666\nCOO: coo@example.com, 555-777-8888',
    tags: ['leadership', 'executives', 'management'],
    icon: Phone,
    attachments: [],
    updatedAt: '1 month ago',
    type: 'text'
  }
];

const Library = () => {
  const [referenceItems, setReferenceItems] = useState<ReferenceItem[]>(initialReferenceItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [tableHeaders, setTableHeaders] = useState<string[]>(['Column 1', 'Column 2', 'Column 3']);
  const [tableRows, setTableRows] = useState<string[][]>([['', '', ''], ['', '', '']]);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      tags: [] as string[],
      newTag: '',
      attachments: [] as ReferenceAttachment[],
      type: 'text' as ReferenceItemType,
      imageUrl: '',
      tableData: {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [['', '', ''], ['', '', '']]
      }
    }
  });

  useEffect(() => {
    const tags = new Set<string>();
    
    referenceItems.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    
    setAvailableTags(Array.from(tags));
  }, [referenceItems]);

  const filteredItems = referenceItems.filter(item => {
    const matchesSearch = (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.attachments.some(att => att.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const resetForm = (item?: ReferenceItem) => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description,
        content: item.content,
        tags: item.tags,
        newTag: '',
        attachments: item.attachments || [],
        type: item.type,
        imageUrl: item.imageUrl || '',
        tableData: item.tableData || {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [['', '', ''], ['', '', '']]
        }
      });
      
      if (item.tableData) {
        setTableHeaders(item.tableData.headers);
        setTableRows(item.tableData.rows);
      } else {
        setTableHeaders(['Column 1', 'Column 2', 'Column 3']);
        setTableRows([['', '', ''], ['', '', '']]);
      }
    } else {
      form.reset({
        title: '',
        description: '',
        content: '',
        tags: [],
        newTag: '',
        attachments: [],
        type: 'text',
        imageUrl: '',
        tableData: {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [['', '', ''], ['', '', '']]
        }
      });
      setTableHeaders(['Column 1', 'Column 2', 'Column 3']);
      setTableRows([['', '', ''], ['', '', '']]);
    }
  };

  const handleEditItem = (item: ReferenceItem) => {
    setEditingItem(item);
    resetForm(item);
    setIsEditDialogOpen(true);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    resetForm();
    setIsNewItemDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ReferenceAttachment[] = [];
    
    Array.from(files).forEach(file => {
      const fakeUrl = URL.createObjectURL(file);
      
      newAttachments.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fakeUrl
      });
    });

    const currentAttachments = form.getValues('attachments') || [];
    form.setValue('attachments', [...currentAttachments, ...newAttachments]);
    
    e.target.value = '';
  };

  const addTableColumn = () => {
    setTableHeaders([...tableHeaders, `Column ${tableHeaders.length + 1}`]);
    setTableRows(tableRows.map(row => [...row, '']));
  };

  const removeTableColumn = (index: number) => {
    if (tableHeaders.length <= 1) return;
    
    const newHeaders = [...tableHeaders];
    newHeaders.splice(index, 1);
    setTableHeaders(newHeaders);
    
    const newRows = tableRows.map(row => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    });
    setTableRows(newRows);
  };

  const addTableRow = () => {
    const newRow = Array(tableHeaders.length).fill('');
    setTableRows([...tableRows, newRow]);
  };

  const removeTableRow = (index: number) => {
    if (tableRows.length <= 1) return;
    
    const newRows = [...tableRows];
    newRows.splice(index, 1);
    setTableRows(newRows);
  };

  const updateTableHeader = (index: number, value: string) => {
    const newHeaders = [...tableHeaders];
    newHeaders[index] = value;
    setTableHeaders(newHeaders);
  };

  const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...tableRows];
    newRows[rowIndex][colIndex] = value;
    setTableRows(newRows);
  };

  const onSubmit = (data: any) => {
    const processedTags = [...data.tags];
    if (data.newTag && !processedTags.includes(data.newTag)) {
      processedTags.push(data.newTag);
    }
    
    let tableData = undefined;
    if (data.type === 'database') {
      tableData = {
        headers: tableHeaders,
        rows: tableRows
      };
    }
    
    let icon;
    switch (data.type) {
      case 'image':
        icon = ImageIcon;
        break;
      case 'file':
        icon = FileArchive;
        break;
      case 'database':
        icon = TableIcon;
        break;
      case 'text':
      default:
        icon = TypeIcon;
        break;
    }
    
    const newItem: ReferenceItem = {
      id: editingItem ? editingItem.id : Date.now(),
      title: data.title,
      description: data.description,
      content: data.content,
      tags: processedTags,
      icon: editingItem?.icon || icon,
      attachments: data.attachments || [],
      updatedAt: 'Just now',
      type: data.type,
      imageUrl: data.type === 'image' ? data.imageUrl : undefined,
      tableData: tableData
    };
    
    if (editingItem) {
      setReferenceItems(prevItems => 
        prevItems.map(item => item.id === editingItem.id ? newItem : item)
      );
      toast.success("Item updated successfully");
    } else {
      setReferenceItems(prevItems => [...prevItems, newItem]);
      toast.success("New item added successfully");
    }
    
    setEditingItem(null);
    setIsEditDialogOpen(false);
    setIsNewItemDialogOpen(false);
    resetForm();
  };

  const handleDeleteItem = (id: number) => {
    setReferenceItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success("Item deleted successfully");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const startEditTag = (tag: string) => {
    setEditingTag(tag);
    setNewTagValue(tag);
  };

  const saveEditedTag = () => {
    if (editingTag && newTagValue && newTagValue !== editingTag) {
      setReferenceItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          tags: item.tags.map(tag => tag === editingTag ? newTagValue : tag)
        }))
      );
      
      setSelectedTags(prevTags => 
        prevTags.map(tag => tag === editingTag ? newTagValue : tag)
      );
      
      setAvailableTags(prevTags => {
        const newTags = prevTags.filter(tag => tag !== editingTag);
        return [...newTags, newTagValue];
      });
      
      toast.success(`Tag updated from "${editingTag}" to "${newTagValue}"`);
    }
    
    setEditingTag(null);
    setNewTagValue('');
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setNewTagValue('');
  };

  const deleteTag = (tagToDelete: string) => {
    setReferenceItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        tags: item.tags.filter(tag => tag !== tagToDelete)
      }))
    );
    
    setSelectedTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
    
    setAvailableTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
    
    toast.success(`Tag "${tagToDelete}" deleted`);
  };

  const renderContentByType = (item: ReferenceItem) => {
    switch (item.type) {
      case 'image':
        return (
          <div className="mt-2">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-auto rounded-md object-cover max-h-28"
              />
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-100 rounded-md">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="mt-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileArchive className="mr-2 h-4 w-4" />
              <span>{item.attachments.length} file(s) attached</span>
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="mt-2 overflow-hidden">
            {item.tableData && (
              <div className="overflow-x-auto text-xs border rounded-md">
                <table className="min-w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {item.tableData.headers.slice(0, 3).map((header, index) => (
                        <th key={index} className="px-2 py-1.5 font-medium text-left truncate">
                          {header}
                        </th>
                      ))}
                      {item.tableData.headers.length > 3 && (
                        <th className="px-2 py-1.5 font-medium text-left">
                          +{item.tableData.headers.length - 3} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {item.tableData.rows.slice(0, 1).map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        {row.slice(0, 3).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1 truncate border-t">
                            {cell || '—'}
                          </td>
                        ))}
                        {row.length > 3 && (
                          <td className="px-2 py-1 truncate border-t">...</td>
                        )}
                      </tr>
                    ))}
                    {item.tableData.rows.length > 1 && (
                      <tr>
                        <td colSpan={Math.min(item.tableData.headers.length, 4)} className="px-2 py-1 text-center text-muted-foreground border-t text-xs">
                          +{item.tableData.rows.length - 1} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        );
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Reference Library</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Access and manage shared knowledge, processes, and contacts
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" /> Add New Entry
          </Button>
        </div>

        <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Reference</DialogTitle>
              <DialogDescription>Create a new reference item in your library.</DialogDescription>
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
                        <Input {...field} />
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
                        <Textarea {...field} />
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
                        <Textarea {...field} />
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
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value.length > 0 ? field.value[0] : ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tags" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTags.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Tag</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachments</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("type") === "image" && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("type") === "database" && (
                  <div className="space-y-3 border p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Table Data</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addTableColumn}
                      >
                        Add Column
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto border rounded-md">
                      <table className="min-w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            {tableHeaders.map((header, index) => (
                              <th key={index} className="px-2 py-1">
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={header}
                                    onChange={(e) => updateTableHeader(index, e.target.value)}
                                    className="h-7 text-xs w-full"
                                    placeholder="Column name"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => removeTableColumn(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} className="px-2 py-1 border-t">
                                  <Input
                                    value={cell}
                                    onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                    className="h-7 text-xs"
                                    placeholder="Cell value"
                                  />
                                </td>
                              ))}
                              <td className="w-10 border-t">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeTableRow(rowIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addTableRow}
                    >
                      Add Row
                    </Button>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit">Save reference</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Reference</DialogTitle>
              <DialogDescription>Update this reference item in your library.</DialogDescription>
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
                        <Input {...field} />
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
                        <Textarea {...field} />
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
                        <Textarea {...field} />
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
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value.length > 0 ? field.value[0] : ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tags" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTags.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Tag</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachments</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("type") === "image" && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("type") === "database" && (
                  <div className="space-y-3 border p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Table Data</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addTableColumn}
                      >
                        Add Column
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto border rounded-md">
                      <table className="min-w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            {tableHeaders.map((header, index) => (
                              <th key={index} className="px-2 py-1">
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={header}
                                    onChange={(e) => updateTableHeader(index, e.target.value)}
                                    className="h-7 text-xs w-full"
                                    placeholder="Column name"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => removeTableColumn(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} className="px-2 py-1 border-t">
                                  <Input
                                    value={cell}
                                    onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                    className="h-7 text-xs"
                                    placeholder="Cell value"
                                  />
                                </td>
                              ))}
                              <td className="w-10 border-t">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeTableRow(rowIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addTableRow}
                    >
                      Add Row
                    </Button>
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit">Update reference</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 mt-6">
          <div className="space-y-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <Tag className="h-3.5 w-3.5 mr-1.5" /> Tags
                </h3>
                {availableTags.length > 0 && (
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
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map(tag => (
                    <div key={tag} className="flex items-center mb-1">
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
                              <Edit className="h-2.5 w-2.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-4 w-4 p-0 text-destructive"
                              onClick={() => deleteTag(tag)}
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No tags available
                </div>
              )}
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <RotateCcw className="mr-1.5 h-3 w-3" />
              <span>Last updated: Today</span>
            </div>
          </div>
          
          <div>
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted/40">
                      <CardHeader className="pb-2 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-full">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {item.updatedAt}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-1 min-h-[60px]">
                        {renderContentByType(item)}
                        
                        {item.attachments && item.attachments.length > 0 && item.type !== 'file' && (
                          <div className="mt-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <FileArchive className="h-3.5 w-3.5" />
                              <span>{item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      
                      <div className="px-6 pb-1">
                        <div className="flex flex-wrap gap-1 mb-3 min-h-[26px] max-h-[52px] overflow-hidden">
                          {item.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="text-xs py-0.5 px-1.5 bg-muted/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <CardFooter className="justify-between gap-2 border-t pt-2.5 pb-3 bg-muted/5">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">View Details</Button>
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
                              
                              {item.type === 'text' && (
                                <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
                                  {item.content}
                                </div>
                              )}
                              
                              {item.type === 'image' && item.imageUrl && (
                                <div className="flex justify-center">
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    className="max-w-full max-h-[400px] object-contain rounded-md"
                                  />
                                </div>
                              )}
                              
                              {item.type === 'database' && item.tableData && (
                                <div className="overflow-x-auto border rounded-md">
                                  <table className="min-w-full">
                                    <thead className="bg-muted/50">
                                      <tr>
                                        {item.tableData.headers.map((header, index) => (
                                          <th key={index} className="px-4 py-2 font-medium text-left">
                                            {header}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.tableData.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                                          {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 border-t">
                                              {cell || '—'}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              
                              {item.attachments && item.attachments.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">Attachments</h4>
                                  <div className="space-y-2">
                                    {item.attachments.map(attachment => (
                                      <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                                        <div className="flex items-center">
                                          <FileArchive className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span>{attachment.name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">
                                            ({(attachment.size / 1024).toFixed(1)} KB)
                                          </span>
                                        </div>
                                        <div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                          >
                                            <a href={attachment.url} download={attachment.name}>
                                              <Download className="h-4 w-4 mr-1" /> Download
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <DialogFooter className="flex justify-between mt-4">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                  >
                                    <Trash className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Reference Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive/10 h-8"
                            >
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reference Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-muted/10 rounded-lg">
                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground/70">No reference items found</h3>
                <p className="text-sm text-muted-foreground/50 mt-1">
                  Try changing your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Library;

