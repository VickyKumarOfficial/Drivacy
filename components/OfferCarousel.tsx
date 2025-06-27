import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Gift, Percent, Star, Zap } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 40;

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  icon: any;
  gradient: string[];
  textColor: string;
}

const offers: Offer[] = [
  {
    id: '1',
    title: 'First Ride Free',
    description: 'Welcome to Drivacy! Your first ride is on us.',
    discount: '100% OFF',
    code: 'WELCOME100',
    icon: Gift,
    gradient: ['#667eea', '#764ba2'],
    textColor: '#ffffff',
  },
  {
    id: '2',
    title: 'Weekend Special',
    description: 'Save big on weekend rides with friends.',
    discount: '25% OFF',
    code: 'WEEKEND25',
    icon: Percent,
    gradient: ['#f093fb', '#f5576c'],
    textColor: '#ffffff',
  },
  {
    id: '3',
    title: 'Premium Member',
    description: 'Unlock exclusive benefits and priority booking.',
    discount: 'UPGRADE',
    code: 'GOPREMIUM',
    icon: Star,
    gradient: ['#ffecd2', '#fcb69f'],
    textColor: '#8b4513',
  },
  {
    id: '4',
    title: 'Electric Rides',
    description: 'Go green and save more with electric vehicles.',
    discount: '15% OFF',
    code: 'GOGREEN15',
    icon: Zap,
    gradient: ['#a8edea', '#fed6e3'],
    textColor: '#059669',
  },
];

export default function OfferCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      setCurrentIndex(nextIndex);
      
      scrollViewRef.current?.scrollTo({
        x: nextIndex * cardWidth,
        animated: true,
      });
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / cardWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exclusive Offers</Text>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContainer}
      >
        {offers.map((offer) => {
          const IconComponent = offer.icon;
          return (
            <TouchableOpacity
              key={offer.id}
              style={[
                styles.offerCard,
                {
                  backgroundColor: offer.gradient[0],
                  // Create gradient effect with overlay
                }
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <View style={styles.iconWrapper}>
                    <IconComponent color={offer.textColor} size={24} />
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{offer.discount}</Text>
                  </View>
                </View>
                
                <Text style={[styles.offerTitle, { color: offer.textColor }]}>
                  {offer.title}
                </Text>
                <Text style={[styles.offerDescription, { color: offer.textColor, opacity: 0.8 }]}>
                  {offer.description}
                </Text>
                
                <View style={styles.codeContainer}>
                  <Text style={[styles.codeLabel, { color: offer.textColor, opacity: 0.7 }]}>
                    Use Code:
                  </Text>
                  <Text style={[styles.codeText, { color: offer.textColor }]}>
                    {offer.code}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <View style={styles.pagination}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  offerCard: {
    width: cardWidth,
    height: 160,
    borderRadius: 20,
    marginRight: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  offerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
  offerDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginRight: 8,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2563eb',
    width: 12,
  },
});