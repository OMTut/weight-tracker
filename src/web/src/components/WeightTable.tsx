import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getWeightEntries,
  deleteWeightEntry,
  updateWeightEntry,
} from "@/lib/apiService";
import type { WeightEntry } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeightTableProps {
  refreshKey: number;
  onEntryUpdated: () => void;
  onEntryDeleted: () => void;
}

/**
 * Paginated weight entries table with Date, Weight, and Actions columns.
 * entries === null means initial load is in progress.
 * Fetches 10 entries per page and shows pagination controls.
 */
export function WeightTable({
  refreshKey,
  onEntryUpdated,
  onEntryDeleted,
}: WeightTableProps) {
  const { user } = useAuth();
  // null = loading (initial only), [] = loaded empty, [...] = has data
  const [entries, setEntries] = useState<WeightEntry[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const lastRefreshKeyRef = useRef(refreshKey);

  useEffect(() => {
    const isRefresh = lastRefreshKeyRef.current !== refreshKey;
    lastRefreshKeyRef.current = refreshKey;
    // On refresh (new entry added), always fetch page 1
    const fetchPage = isRefresh ? 1 : page;

    let cancelled = false;
    getWeightEntries({ page: fetchPage, page_size: 10, time_filter: "all" })
      .then((res) => {
        if (!cancelled) {
          setEntries(res.entries);
          setTotalPages(res.total_pages === 0 ? 1 : res.total_pages);
          // Sync page state to 1 after fetching page 1 on refresh
          if (isRefresh && fetchPage !== page) {
            setPage(1);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  /**
   * Deletes the entry with the given id, then refreshes the current page.
   * Notifies the parent via onEntryDeleted so the chart can also refresh.
   */
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteWeightEntry(id);
      onEntryDeleted();
      const res = await getWeightEntries({
        page,
        page_size: 10,
        time_filter: "all",
      });
      setEntries(res.entries);
      const newTotalPages = res.total_pages === 0 ? 1 : res.total_pages;
      setTotalPages(newTotalPages);
      if (page > newTotalPages) {
        setPage(newTotalPages);
      }
    } catch {
      // Silently ignore — table will refresh on next interaction
    } finally {
      setDeletingId(null);
    }
  }

  /** Validates the edited value and calls PUT /api/weight/{id} on success. */
  async function handleSave(id: string) {
    const parsed = parseFloat(editingValue);
    if (!editingValue || isNaN(parsed) || parsed <= 0) {
      setEditError("Enter a positive number");
      return;
    }
    setSavingId(id);
    setEditError(null);
    try {
      await updateWeightEntry(id, parsed);
      setEditingId(null);
      setEditingValue("");
      onEntryUpdated();
      const res = await getWeightEntries({
        page,
        page_size: 10,
        time_filter: "all",
      });
      setEntries(res.entries);
      setTotalPages(res.total_pages === 0 ? 1 : res.total_pages);
    } catch {
      setEditError("Failed to save. Try again.");
    } finally {
      setSavingId(null);
    }
  }

  /** Exits edit mode without saving. */
  function handleCancel() {
    setEditingId(null);
    setEditingValue("");
    setEditError(null);
  }

  return (
    <div className="rounded-lg border" data-testid="weight-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries === null ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground text-center"
              >
                Loading…
              </TableCell>
            </TableRow>
          ) : entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground text-center"
                data-testid="table-empty"
              >
                No entries yet
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => {
              const isEditing = editingId === entry.id;
              return (
                <TableRow key={entry.id} data-testid="table-row">
                  <TableCell>
                    {format(parseISO(entry.recorded_at), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex flex-col gap-1">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          autoFocus
                          value={editingValue}
                          onChange={(e) => {
                            setEditingValue(e.target.value);
                            setEditError(null);
                          }}
                          data-testid="edit-weight-input"
                          className="w-28"
                        />
                        {editError && (
                          <span
                            className="text-destructive text-xs"
                            data-testid="edit-error"
                          >
                            {editError}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        {entry.weight_value} {user?.weight_unit ?? "lbs"}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          data-testid="save-edit"
                          disabled={savingId === entry.id}
                          onClick={() => void handleSave(entry.id)}
                        >
                          {savingId === entry.id ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="cancel-edit"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`actions-menu-${entry.id}`}
                            aria-label="Entry actions"
                            disabled={deletingId === entry.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            data-testid={`edit-entry-${entry.id}`}
                            onClick={() => {
                              setEditingId(entry.id);
                              setEditingValue(String(entry.weight_value));
                              setEditError(null);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            data-testid={`delete-entry-${entry.id}`}
                            disabled={deletingId === entry.id}
                            onClick={() => void handleDelete(entry.id)}
                          >
                            {deletingId === entry.id ? "Deleting…" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t px-4 py-2">
        <span className="text-muted-foreground text-sm" data-testid="page-info">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            data-testid="prev-page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            data-testid="next-page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
