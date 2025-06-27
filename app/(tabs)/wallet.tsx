import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Gift, CreditCard, Coins } from 'lucide-react-native';
import Header from '@/components/Header';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  method: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'debit',
    amount: 285,
    description: 'Ride to Office Complex',
    date: '2024-01-15',
    method: 'UPI',
  },
  {
    id: '2',
    type: 'credit',
    amount: 500,
    description: 'Wallet Top-up',
    date: '2024-01-14',
    method: 'Card',
  },
  {
    id: '3',
    type: 'credit',
    amount: 50,
    description: 'Referral Bonus',
    date: '2024-01-13',
    method: 'Bonus',
  },
  {
    id: '4',
    type: 'debit',
    amount: 180,
    description: 'Ride to Shopping Mall',
    date: '2024-01-12',
    method: 'RideCoins',
  },
];

export default function WalletScreen() {
  const [walletBalance] = useState(1250);
  const [rideCoins] = useState(850);

  const totalCredits = mockTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = mockTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Wallet" showNotifications={false} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Wallet Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.walletIcon}>
              <Wallet color="#ffffff" size={24} />
            </View>
            <TouchableOpacity style={styles.addMoneyButton}>
              <Plus color="#2563eb" size={20} />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₹{walletBalance.toLocaleString()}</Text>
          
          <View style={styles.coinsContainer}>
            <View style={styles.coinsIcon}>
              <Coins color="#fbbf24" size={20} />
            </View>
            <Text style={styles.coinsText}>{rideCoins} RideCoins</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#059669' }]}>
                <Plus color="#ffffff" size={20} />
              </View>
              <Text style={styles.actionText}>Add Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#2563eb' }]}>
                <ArrowUpRight color="#ffffff" size={20} />
              </View>
              <Text style={styles.actionText}>Send Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                <Gift color="#ffffff" size={20} />
              </View>
              <Text style={styles.actionText}>Rewards</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#ef4444' }]}>
                <CreditCard color="#ffffff" size={20} />
              </View>
              <Text style={styles.actionText}>Cards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <ArrowDownLeft color="#059669" size={20} />
              </View>
              <Text style={styles.summaryAmount}>₹{totalCredits}</Text>
              <Text style={styles.summaryLabel}>Money In</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <ArrowUpRight color="#ef4444" size={20} />
              </View>
              <Text style={styles.summaryAmount}>₹{totalDebits}</Text>
              <Text style={styles.summaryLabel}>Money Out</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {mockTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'credit' ? '#dcfce7' : '#fee2e2' }
                ]}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownLeft color="#059669" size={16} />
                  ) : (
                    <ArrowUpRight color="#ef4444" size={16} />
                  )}
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()} • {transaction.method}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'credit' ? '#059669' : '#ef4444' }
              ]}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#2563eb',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addMoneyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#2563eb',
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  coinsIcon: {
    marginRight: 8,
  },
  coinsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  transactionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});