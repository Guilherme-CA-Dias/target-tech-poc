import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Record } from "@/types/record"

interface DeleteConfirmationDialogProps {
  record: Record | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (record: Record) => Promise<void>
}

export function DeleteConfirmationDialog({
  record,
  isOpen,
  onClose,
  onConfirm
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    if (!record) return
    await onConfirm(record)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Record</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this record? This action cannot be undone.
          </p>
          <p className="mt-2 text-sm font-medium">
            Record ID: <span className="font-mono">{record?.id}</span>
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gray-100 text-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-red-100 text-red-700 hover:bg-red-200"
          >
            Delete Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 