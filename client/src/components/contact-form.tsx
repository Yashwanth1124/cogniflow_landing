
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

export function ContactForm({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      
      toast({
        title: 'Support request submitted',
        description: 'We will get back to you soon.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit support request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Input
          name="name"
          placeholder="Your Name"
          required
          className="mb-2"
        />
        <Input
          name="email"
          type="email"
          placeholder="Email Address"
          required
          className="mb-2"
        />
        <Input
          name="subject"
          placeholder="Subject"
          required
          className="mb-2"
        />
        <Textarea
          name="message"
          placeholder="How can we help?"
          required
          className="mb-2"
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
