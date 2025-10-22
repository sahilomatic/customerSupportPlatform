import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
  CardActions,
} from "@mui/material";
import { Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CommentIcon from "@mui/icons-material/Comment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import { getTickets, updateTicketStatus, addComment, getComments } from "../api/api";

interface Ticket {
  id: number;
  ticket_number: string;
  name: string;
  father_name: string;
  address: string;
  pincode: string;
  mobile_number: string;
  event_date: string;
  query: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: number;
  ticket_id: number;
  author_name: string;
  comment_text: string;
  created_at: string;
}

const ViewTickets: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<"created_at" | "status" | null>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Column-level filters
  const [columnFilters, setColumnFilters] = useState({
    ticketNumber: "",
    name: "",
    mobile: "",
    eventDate: "",
  });

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const result = await getTickets(statusFilter === "All" ? undefined : statusFilter, searchTerm);
      setTickets(result.tickets);
      setFilteredTickets(result.tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticket_number.toLowerCase().includes(search) ||
          ticket.name.toLowerCase().includes(search) ||
          ticket.mobile_number.includes(search) ||
          ticket.pincode.includes(search)
      );
    }

    // Apply column-level filters
    if (columnFilters.ticketNumber) {
      filtered = filtered.filter((ticket) =>
        ticket.ticket_number.toLowerCase().includes(columnFilters.ticketNumber.toLowerCase())
      );
    }
    if (columnFilters.name) {
      filtered = filtered.filter((ticket) =>
        ticket.name.toLowerCase().includes(columnFilters.name.toLowerCase())
      );
    }
    if (columnFilters.mobile) {
      filtered = filtered.filter((ticket) =>
        ticket.mobile_number.includes(columnFilters.mobile)
      );
    }
    if (columnFilters.eventDate) {
      filtered = filtered.filter((ticket) =>
        ticket.event_date.includes(columnFilters.eventDate)
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let compareValue = 0;

        if (sortField === "created_at") {
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortField === "status") {
          // Define status order: Open > In Progress > Closed
          const statusOrder: Record<string, number> = {
            "Open": 1,
            "In Progress": 2,
            "Closed": 3,
          };
          compareValue = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
        }

        return sortDirection === "asc" ? compareValue : -compareValue;
      });
    }

    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, tickets, columnFilters, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "error";
      case "In Progress":
        return "warning";
      case "Closed":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsDialog(true);
    setNewComment("");
    setAuthorName("");

    // Load comments
    await loadComments(ticket.ticket_number);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedTicket(null);
    setComments([]);
    setNewComment("");
    setAuthorName("");
  };

  const loadComments = async (ticketNumber: string) => {
    setLoadingComments(true);
    try {
      const result = await getComments(ticketNumber);
      setComments(result.comments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !authorName.trim() || !newComment.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      await addComment(selectedTicket.ticket_number, authorName, newComment);
      setNewComment("");
      setAuthorName("");
      await loadComments(selectedTicket.ticket_number);
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTicket) return;

    setUpdatingStatus(true);
    try {
      await updateTicketStatus(selectedTicket.ticket_number, newStatus);

      // Update local state
      setSelectedTicket({ ...selectedTicket, status: newStatus });

      // Refresh ticket list
      await fetchTickets();

      alert(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update ticket status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSort = (field: "created_at" | "status") => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (field: "created_at" | "status") => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          mb: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FilterListIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                View All Tickets
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Tickets: {filteredTickets.length}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchTickets} sx={{ color: "white" }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search by ticket number, name, mobile, or pincode"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        /* Mobile Card View */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredTickets.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No tickets found</Typography>
            </Paper>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: "monospace", fontWeight: "bold", color: "primary.main" }}
                    >
                      {ticket.ticket_number}
                    </Typography>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2"><strong>{ticket.name}</strong></Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2">{ticket.mobile_number}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2">{formatEventDate(ticket.event_date)}</Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    Created: {formatDate(ticket.created_at)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(ticket)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Ticket #</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Event Date</TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("status")}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Status
                    {renderSortIcon("status")}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("created_at")}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Created
                    {renderSortIcon("created_at")}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
              {/* Column-level filter row */}
              <TableRow sx={{ backgroundColor: "#fafafa" }}>
                <TableCell sx={{ py: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Filter..."
                    value={columnFilters.ticketNumber}
                    onChange={(e) =>
                      setColumnFilters({ ...columnFilters, ticketNumber: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    sx={{ minWidth: 120 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Filter..."
                    value={columnFilters.name}
                    onChange={(e) =>
                      setColumnFilters({ ...columnFilters, name: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    sx={{ minWidth: 120 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Filter..."
                    value={columnFilters.mobile}
                    onChange={(e) =>
                      setColumnFilters({ ...columnFilters, mobile: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    sx={{ minWidth: 120 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Filter..."
                    value={columnFilters.eventDate}
                    onChange={(e) =>
                      setColumnFilters({ ...columnFilters, eventDate: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    sx={{ minWidth: 120 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  {/* Status column - no filter needed as it's already filtered above */}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  {/* Created column - no filter */}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Button
                    size="small"
                    onClick={() =>
                      setColumnFilters({
                        ticketNumber: "",
                        name: "",
                        mobile: "",
                        eventDate: "",
                      })
                    }
                    sx={{ fontSize: "0.7rem" }}
                  >
                    Clear
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No tickets found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    hover
                    sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontWeight: "bold", color: "primary.main" }}
                      >
                        {ticket.ticket_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{ticket.name}</TableCell>
                    <TableCell>{ticket.mobile_number}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatEventDate(ticket.event_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(ticket.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(ticket)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Ticket Details
                </Typography>
                <Chip
                  label={selectedTicket.status}
                  color={getStatusColor(selectedTicket.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
                    <Typography variant="caption" color="text.secondary">
                      Ticket Number
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: "monospace", color: "primary.main" }}
                    >
                      {selectedTicket.ticket_number}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Status Update Section */}
                <Grid size={12}>
                  <Paper sx={{ p: 2, backgroundColor: "#fff3e0" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                      Update Status
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant={selectedTicket.status === "Open" ? "contained" : "outlined"}
                        color="error"
                        disabled={updatingStatus || selectedTicket.status === "Open"}
                        onClick={() => handleStatusUpdate("Open")}
                      >
                        Open
                      </Button>
                      <Button
                        size="small"
                        variant={selectedTicket.status === "In Progress" ? "contained" : "outlined"}
                        color="warning"
                        disabled={updatingStatus || selectedTicket.status === "In Progress"}
                        onClick={() => handleStatusUpdate("In Progress")}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="small"
                        variant={selectedTicket.status === "Closed" ? "contained" : "outlined"}
                        color="success"
                        disabled={updatingStatus || selectedTicket.status === "Closed"}
                        onClick={() => handleStatusUpdate("Closed")}
                        startIcon={<CheckCircleIcon />}
                      >
                        Closed
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedTicket.name}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Father's Name
                  </Typography>
                  <Typography variant="body1">{selectedTicket.father_name}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">{selectedTicket.address}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Pincode
                  </Typography>
                  <Typography variant="body1">{selectedTicket.pincode}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Mobile Number
                  </Typography>
                  <Typography variant="body1">{selectedTicket.mobile_number}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Event Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "primary.main" }}>
                    {formatEventDate(selectedTicket.event_date)}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">
                    Query
                  </Typography>
                  <Paper sx={{ p: 2, mt: 1, backgroundColor: "#f9f9f9" }}>
                    <Typography variant="body1">{selectedTicket.query}</Typography>
                  </Paper>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Ticket Raised On
                  </Typography>
                  <Typography variant="body2">{formatDate(selectedTicket.created_at)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">{formatDate(selectedTicket.updated_at)}</Typography>
                </Grid>

                {/* Comments Section */}
                <Grid size={12}>
                  <Paper sx={{ p: 2, backgroundColor: "#e3f2fd", mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <CommentIcon color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        Comments ({comments.length})
                      </Typography>
                    </Box>

                    {/* Add Comment Form */}
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Your Name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        label="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddComment}
                        disabled={submittingComment || !authorName.trim() || !newComment.trim()}
                        sx={{ mt: 1 }}
                      >
                        {submittingComment ? "Adding..." : "Add Comment"}
                      </Button>
                    </Box>

                    {/* Comments List */}
                    {loadingComments ? (
                      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : comments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                        No comments yet
                      </Typography>
                    ) : (
                      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                        {comments.map((comment) => (
                          <Paper key={comment.id} sx={{ p: 1.5, mb: 1, backgroundColor: "white" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                                {comment.author_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.created_at)}
                              </Typography>
                            </Box>
                            <Typography variant="body2">{comment.comment_text}</Typography>
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ViewTickets;
