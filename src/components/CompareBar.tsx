import { Link } from "react-router-dom";
import { useCompare } from "@/lib/compare";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CompareBar() {
  const { selected, remove, clear } = useCompare();

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        >
          <div className="container flex items-center gap-4 py-3">
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Compare ({selected.length}/3):
              </span>
              {selected.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm flex-shrink-0"
                >
                  <img
                    src={p.images?.[0] || "/placeholder.svg"}
                    alt=""
                    className="h-6 w-6 rounded object-cover"
                  />
                  <span className="max-w-[120px] truncate text-foreground">{p.title}</span>
                  <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={clear}>
                Clear
              </Button>
              {selected.length >= 2 && (
                <Button asChild size="sm">
                  <Link to="/compare">
                    Compare <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
