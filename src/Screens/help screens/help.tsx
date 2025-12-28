import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import { useAppContext } from "../../Store/contexts/app-context";
import Header from "../helpers/header";
import Loader from "../helpers/loader";
import AlertMessage from "../helpers/alertmessage";
import NeedHelpPopup from "./NeedHelpScreen";
import apiService from "../../Axios/Api";
import { pallette } from "../helpers/colors";
import { medium } from "../helpers/fonts";
import { adjust, h } from "../../constants/dimensions";

// Types
interface Note {
  id: number;
  title: string;
  notes: string;
}

interface Ticket {
  id: number;
  ticketId: string;
  issue: string;
  category: string;
  email?: string;
  status: string;
  description?: string | null;
  comment?: string | null;
  notes?: Note[] | null;
  createdAt?: string | null;
}

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppContext();
  
  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [alertComponent, setAlertComponent] = useState<React.ReactNode>(null);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
       const res = await apiService.getAllTickets(user?.id);
   
      if (res.error === false) {
        setTickets(res.data || []);
      } else {
        throw new Error(res.message || 'Failed to fetch tickets');
      }
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load tickets',
        text2: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, refreshing]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filter tickets based on tab
  const filteredTickets = tickets.filter(ticket => {
    if (!ticket.status) return false;
    
    const status = ticket.status.toLowerCase();
    if (activeTab === "open") {
      return status === "open" || status === "inprogress"||status==='in_progress';
    } else {
      return status === "closed" || status === "resolved";
    }
  });

  // Create new ticket
  const handleCreateTicket = async (ticketData: {
    issue: string;
    comment: string;
    email: string;
  }) => {
    try {
      setLoading(true);
      const res = await apiService.createTicket({
        userId: user?.id,
        title: ticketData.issue,
        description: ticketData.comment,
        email: ticketData.email
      });

      if (res.error === false) {
        Toast.show({
          type: 'success',
          text1: res.message,
          text2: `Ticket TKT-${res.data.id} has been created`,
        });

        setTickets(prev => [res.data, ...prev]);
      } else {
        throw new Error(res.message || 'Failed to create ticket');
      }
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Ticket',
        text2: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const handleUpdateTicketStatus = async (ticket: Ticket) => {
    try {
      const res = await apiService.updateTicketStatus({
        userId: user?.id,
        ticketId: ticket.id,
        status: 'RESOLVED'
      });

      if (res.error === false) {
        setTickets(prev => prev.map(t => 
          t.id === ticket.id ? { ...t, status: 'RESOLVED' } : t
        ));
        
        Toast.show({
          type: 'success',
          text1: 'Ticket Updated',
          text2: `Ticket #TKT-${ticket.id} has been resolved`,
        });
      } else {
        throw new Error(res.message || 'Failed to update ticket');
      }
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Failed to update ticket',
      });
    }
  };

  // Show confirmation alert for ticket update
  const showUpdateConfirmation = (ticket: Ticket) => {
    setAlertComponent(
      <AlertMessage
        message={`Resolve Ticket TKT-${ticket.id}?`}
        showConfirm={true}
        onClose={async (confirmed: boolean) => {
          setAlertComponent(null);
          if (confirmed) {
            await handleUpdateTicketStatus(ticket);
          }
        }}
      />
    );
  };

  // Handle email reply
  const handleEmailReply = (email: string) => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email Failed',
        text2: 'Email not available',
      });
      return;
    }

    const emailUrl = `mailto:${email}`;
    Linking.openURL(emailUrl).catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Email Failed',
        text2: 'Unable to open email app',
      });
    });
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'open': return pallette.primary;
      case 'closed': return pallette.lightred;
      case 'resolved': return pallette.l2;
      case 'inprogress': return pallette.gold;
      default: return pallette.grey;
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'open': return 'OPEN';
      case 'closed': return 'CLOSED';
      case 'resolved': return 'RESOLVED';
      case 'inprogress': return 'IN PROGRESS';
      default: return status.toUpperCase();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Render ticket item
  const renderTicket = ({ item }: { item: Ticket }) => {
    const isAdmin = user?.role === 'admin';
    const isResolvedOrClosed = ['resolved', 'closed'].includes(item.status.toLowerCase());
    const showActions = isAdmin && !isResolvedOrClosed;

    return (
      <View style={styles.ticketCard}>
        {/* Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketIdContainer}>
            <Text style={styles.ticketId}>TKT-{item.id}</Text>
            <Text style={styles.ticketCategory}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.ticketStatus, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        {/* Content */}
        <Text style={styles.ticketIssue}>{item.description}</Text>
        
        {item.comment && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Description:</Text>
            <Text style={styles.comment}>💬 {item.comment}</Text>
          </View>
        )}
        
        {item.notes?.map(note => (
          <View key={note.id} style={styles.noteItem}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteText}>{note.notes}</Text>
          </View>
        ))}

        {item.createdAt && (
          <Text style={styles.createdDate}>
            Created: {formatDate(item.createdAt)}
          </Text>
        )}
        
        {/* Admin Actions */}
        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleEmailReply(item.email)}
            >
              <Text style={styles.rejectButtonText}>Reply</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => showUpdateConfirmation(item)}
            >
              <Text style={styles.approveButtonText}>Mark as Solved</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        onback={() => navigation.goBack()}
        hastitle={true}
        title={'Help Center'}
        active={1}
        onSkip={() => {}}
        skippable={false}
      />

     
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "open" && styles.activeTab]}
          onPress={() => setActiveTab("open")}
        >
          <Text style={[styles.tabText, activeTab === "open" && styles.activeTabText]}>
            Open Issues
          </Text>
          {activeTab === "open" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "closed" && styles.activeTab]}
          onPress={() => setActiveTab("closed")}
        >
          <Text style={[styles.tabText, activeTab === "closed" && styles.activeTabText]}>
            Closed / Resolved
          </Text>
          {activeTab === "closed" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Ticket Count */}
      <View style={styles.ticketCountContainer}>
        <Text style={styles.ticketCountText}>
          {filteredTickets.length} {activeTab === "open" ? "open" : "closed"} tickets
        </Text>
      </View>

      {/* Ticket List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Loader />
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.ticketId || item.id.toString()}
          renderItem={renderTicket}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTickets();
              }}
              colors={[pallette.primary]}
              tintColor={pallette.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No {activeTab === "open" ? "open" : "closed"} tickets
              </Text>
              <Text style={styles.emptySubText}>
                {activeTab === "open" 
                  ? "All your issues have been resolved!" 
                  : "No closed or resolved tickets yet"}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Popup and Alerts */}
      <NeedHelpPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        onSubmit={handleCreateTicket}
      />
      {alertComponent}
      <Toast position="top" visibilityTime={4000} />
       {/* Create Ticket Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setPopupVisible(true)}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>＋ Create Ticket</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: pallette.white, 
    paddingTop: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: pallette.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: pallette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: pallette.white,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
    position: 'relative',
  },
  activeTab: {},
  tabText: { 
    fontSize: 14, 
    color: pallette.grey,
    fontWeight: '500',
  },
  activeTabText: { 
    color: pallette.primary, 
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -4,
    width: '40%',
    height: 3,
    backgroundColor: pallette.primary,
    borderRadius: 2,
  },
  ticketCountContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  ticketCountText: {
    fontSize: 14,
    color: pallette.grey,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ticketCard: {
    backgroundColor: pallette.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    elevation: 2,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketIdContainer: {
    flex: 1,
  },
  ticketId: { 
    fontWeight: "bold", 
    fontSize: 16,
    color: pallette.black,
    marginBottom: 4,
  },
  ticketCategory: { 
    fontSize: 14, 
    color: pallette.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketStatus: { 
    fontSize: 10, 
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ticketIssue: { 
    fontSize: 14, 
    color: pallette.black,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentContainer: {
    backgroundColor: pallette.lightprimary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentLabel: {
    fontSize: 12,
    color: pallette.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  comment: { 
    fontSize: 13, 
    color: pallette.black,
    lineHeight: 18,
  },
  noteItem: {
    marginBottom: 6,
  },
  noteTitle: {
    fontSize: 13,
    color: pallette.black,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 13,
    color: pallette.grey,
    lineHeight: 16,
  },
  createdDate: {
    fontSize: 12,
    color: pallette.grey,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: h * 0.012,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: pallette.white,
    borderColor: pallette.red,
  },
  rejectButtonText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.red,
  },
  approveButton: {
    backgroundColor: pallette.primary,
    borderColor: pallette.primary,
  },
  approveButtonText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.white,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: pallette.black,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: pallette.grey,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HelpScreen;