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
  Upload,
  Download,
  Eye,
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
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<ReferenceAttachment | null>(null);
  const [isAttachmentPreviewOpen, setIsAttachmentPreviewOpen] = useState(false);
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

  const handleRemoveAttachment = (attachmentId: string) => {
    const currentAttachments = form.getValues('attachments') || [];
    const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
    form.setValue('attachments', updatedAttachments);
  };

  const handlePreviewAttachment = (attachment: ReferenceAttachment) => {
    setSelectedAttachment(attachment);
    setIsAttachmentPreviewOpen(true);
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
          <div className="mt-3">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-auto rounded-md object-cover max-h-36"
              />
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="mt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileArchive className="mr-2 h-4 w-4" />
              <span>{item.attachments.length} file(s) attached</span>
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="mt-3 overflow-hidden">
            {item.tableData && (
              <div className="overflow-x-auto text-xs border rounded-md">
                <table className="min-w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {item.tableData.headers.map((header, index) => (
                        <th key={index} className="px-2 py-2 font-medium text-left truncate">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.tableData.rows.slice(0, 2).map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1.5 truncate border-t">
                            {cell || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {item.tableData.rows.length > 2 && (
                      <tr>
                        <td colSpan={item.tableData.headers.length} className="px-2 py-1 text-center text-muted-foreground border-t">
                          +{item.tableData.rows.length - 2} more rows
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
          <CardDescription>{item.description}</CardDescription>
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
            <h1 className="text-3xl font-bold tracking-tight">Reference Library</h1>
            <p className="text-muted-foreground mt-1">
              Access and manage shared knowledge, processes, and contacts
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" /> Add New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8 mt-8">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2" /> Tags
                </h3>
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
              <div className="flex flex-wrap gap-2.5">
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
                        className="text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5"
                      >
                        <span onClick={() => toggleTag(tag)}>{tag}</span>
                        <div className="flex items-center ml-1.5">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0"
                            onClick={() => startEditTag(tag)}
                          >
                            <Edit className="h-2.5 w-2.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0 text-destructive"
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
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Last updated: Today</span>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.updatedAt}
                          </div>
                        </div>
                        <CardTitle className="mt-3 text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {renderContentByType(item)}
                        
                        {item.attachments && item.attachments.length > 0 && item.type !== 'file' && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">
                              Attachments ({item.attachments.length})
                            </h4>
                            <div className="space-y-2">
                              {item.attachments.map(attachment => (
                                <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded p-2.5 text-xs">
                                  <span className="truncate max-w-[180px]">{attachment.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => handlePreviewAttachment(attachment)}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      asChild
                                    >
                                      <a href={attachment.url} download={attachment.name}>
                                        <Download className="h-3.5 w-3.5" />
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="text-xs py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 pb-4 flex justify-between gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
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
                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handlePreviewAttachment(attachment)}
                                            >
                                              <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
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
                                  <Edit className="h-4 w-4 mr-1" /> Edit Entry
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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

      <Dialog 
        open={isNewItemDialogOpen || !!editingItem} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null);
            setIsNewItemDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Reference Item' : 'Add New Reference Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Update the information for this reference item.' 
                : 'Create a new reference item to store important information.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center">
                            <TypeIcon className="h-4 w-4 mr-2" />
                            <span>Text</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="image">
                          <div className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            <span>Image</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="file">
                          <div className="flex items-center">
                            <FileArchive className="h-4 w-4 mr-2" />
                            <span>File Attachment</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="database">
                          <div className="flex items-center">
                            <TableIcon className="h-4 w-4 mr-2" />
                            <span>Table/Database</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title" {...field} />
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
                        <Input placeholder="Enter a brief description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {form.watch('type') === 'text' && (
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the text content" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch('type') === 'image' && (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter image URL" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      {field.value && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                          <img 
                            src={field.value} 
                            alt="Preview" 
                            className="max-h-48 rounded-md object-contain" 
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch('type') === 'database' && (
                <div className="space-y-4">
                  <div>
                    <FormLabel>Table Data</FormLabel>
                    <div className="border rounded-md p-3 mt-1.5 overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            {tableHeaders.map((header, colIndex) => (
                              <th key={colIndex} className="p-2 border-b">
                                <Input
                                  value={header}
                                  onChange={(e) => updateTableHeader(colIndex, e.target.value)}
                                  className="w-full h-8 text-sm"
                                  placeholder={`Column ${colIndex + 1}`}
                                />
                                {tableHeaders.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 mt-1 text-destructive"
                                    onClick={() => removeTableColumn(colIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </th>
                            ))}
                            <th className="p-2 border-b w-10">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={addTableColumn}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} className="p-2 border-b">
                                  <Input
                                    value={cell}
                                    onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                    className="w-full h-8 text-sm"
                                    placeholder="Value"
                                  />
                                </td>
                              ))}
                              <td className="p-2 border-b w-10">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive"
                                  onClick={() => removeTableRow(rowIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={tableHeaders.length + 1} className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full h-8 border border-dashed border-muted-foreground/30"
                                onClick={addTableRow}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Row
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <div className="flex items-center">
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </label>
                </div>
                
                {form.watch('attachments')?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.watch('attachments').map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between bg-muted/30 rounded-md p-2">
                        <div className="flex items-center text-sm">
                          <FileArchive className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="truncate max-w-xs">{attachment.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePreviewAttachment(attachment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch('tags')?.map((tag, index) => (
                    <Badge key={index} className="px-3 py-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => {
                          const currentTags = form.getValues('tags');
                          form.setValue('tags', currentTags.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="newTag"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input 
                            placeholder="Add a tag" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newTag = form.getValues('newTag');
                      if (newTag) {
                        const currentTags = form.getValues('tags') || [];
                        if (!currentTags.includes(newTag)) {
                          form.setValue('tags', [...currentTags, newTag]);
                          form.setValue('newTag', '');
                        }
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                
                {availableTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Existing tags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.map((tag) => {
                        const isSelected = form.watch('tags')?.includes(tag);
                        return (
                          <Badge 
                            key={tag}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => {
                              const currentTags = form.getValues('tags') || [];
                              if (currentTags.includes(tag)) {
                                form.setValue('tags', currentTags.filter(t => t !== tag));
                              } else {
                                form.setValue('tags', [...currentTags, tag]);
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(null);
                    setIsNewItemDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={isAttachmentPreviewOpen}
        onOpenChange={setIsAttachmentPreviewOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedAttachment?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center items-center h-full">
            {selectedAttachment?.type?.startsWith('image/') ? (
              <img 
                src={selectedAttachment.url} 
                alt={selectedAttachment.name} 
                className="max-h-[60vh] object-contain" 
              />
            ) : selectedAttachment?.type?.includes('pdf') ? (
              <iframe 
                src={selectedAttachment.url} 
                title={selectedAttachment.name} 
                width="100%" 
                height="500px" 
                className="border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileArchive className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg">Preview not available for this file type</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                  asChild
                >
                  <a href={selectedAttachment?.url} download={selectedAttachment?.name}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Library;
