import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Edit2, X } from "lucide-react";

interface RedlineItemProps {
  index: number;
  original: string;
  suggested: string;
  reason?: string;
  onSave: (index: number, newText: string) => Promise<void>;
}

export function RedlineItem({ index, original, suggested, reason, onSave }: RedlineItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(suggested);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(index, editText);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save redline edit", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-sm p-4 bg-secondary/50 rounded-sm border border-border group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-start mb-2">
        <p className="text-muted-foreground font-mono text-[10px] tracking-tight uppercase">
          § Section {index + 1} • {reason || "Compliance Recommendation"}
        </p>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-rose-500/80 line-through leading-relaxed text-xs">
          {original}
        </p>
        
        {isEditing ? (
          <div className="flex gap-2">
            <Input 
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-background border-primary/30 text-xs h-8"
              autoFocus
            />
            <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSave} disabled={loading}>
              <Check className="h-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsEditing(false)}>
              <X className="h-4 h-4" />
            </Button>
          </div>
        ) : (
          <p 
            className="text-emerald-500 font-medium leading-relaxed text-xs cursor-pointer hover:bg-emerald-500/5 rounded px-1 -mx-1 transition-colors"
            onClick={() => setIsEditing(true)}
            title="Click to edit suggestion"
          >
            {suggested}
          </p>
        )}
      </div>
    </div>
  );
}
