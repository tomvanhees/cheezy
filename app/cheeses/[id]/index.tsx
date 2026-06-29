import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { subscribeToRatings, subscribeToUsers, setRating } from '@/lib/firestore';
import { useCheeses, useDeleteCheese, useSetRating } from '@/hooks/useCheeses';
import { useUser } from '@/context/UserContext';
import { RatingBadge } from '@/components/RatingBadge';
import { RatingPicker } from '@/components/RatingPicker';
import { CheeseWedgeSvg } from '@/components/CheeseWedgeSvg';
import { Colors, Fonts, Radius, Shadow } from '@/lib/theme';
import type { Rating, AppUser, RatingLevel } from '@/lib/types';

const TEXTURE_LABELS: Record<string, string> = {
  vers: 'Vers', zacht: 'Zacht', halfzacht: 'Halfzacht', halfhard: 'Halfhard', hard: 'Hard',
};
const MILK_LABELS: Record<string, string> = {
  koe: '🐄 Koe', geit: '🐐 Geit', schaap: '🐑 Schaap', buffel: '🐃 Buffel', gemengd: '🥛 Gemengd',
};

function useCheeseRatings(cheeseId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!cheeseId) return;
    const unsub = subscribeToRatings(cheeseId, (ratings) => {
      queryClient.setQueryData<Rating[]>(['ratings', cheeseId], ratings);
    });
    return unsub;
  }, [cheeseId, queryClient]);
  return useQuery<Rating[]>({
    queryKey: ['ratings', cheeseId],
    queryFn: () => [],
    staleTime: Infinity,
  });
}

function useUsers() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = subscribeToUsers((users) => {
      queryClient.setQueryData<AppUser[]>(['users'], users);
    });
    return unsub;
  }, [queryClient]);
  return useQuery<AppUser[]>({ queryKey: ['users'], queryFn: () => [], staleTime: Infinity });
}

export default function CheeseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const { data: cheeses = [] } = useCheeses();
  const cheese = cheeses.find((c) => c.id === id);

  const { data: ratings = [] } = useCheeseRatings(id);
  const { data: users = [] } = useUsers();
  const deleteCheese = useDeleteCheese();
  const setRatingMutation = useSetRating();

  const myRating = ratings.find((r) => r.userId === user?.id);
  const [myNote, setMyNote] = useState(myRating?.note ?? '');
  const [editingNote, setEditingNote] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const noteInputRef = useRef<TextInput>(null);
  const scrollOffsetY = useRef(0);
  const scrollViewHeight = useRef(0);
  const editingNoteRef = useRef(false);
  editingNoteRef.current = editingNote;

  // Keep note in sync when rating is loaded
  useEffect(() => {
    if (myRating?.note !== undefined) setMyNote(myRating.note);
  }, [myRating?.note]);

  const otherRatings = ratings.filter((r) => r.userId !== user?.id);

  const handleRate = (rating: RatingLevel) => {
    if (!user) return;
    setRatingMutation.mutate({ cheeseId: id, userId: user.id, rating, note: myNote });
  };

  const handleSaveNote = () => {
    if (!user || !myRating) return;
    setRatingMutation.mutate({
      cheeseId: id,
      userId: user.id,
      rating: myRating.rating,
      note: myNote,
    });
    setEditingNote(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Kaas verwijderen',
      `Weet je zeker dat je "${cheese?.name}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            await deleteCheese.mutateAsync(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!cheese) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: cheese.name,
          headerRight: () => (
            <View style={styles.headerBtns}>
              <Pressable onPress={() => router.push(`/cheeses/${id}/edit`)}>
                <Text style={styles.headerBtn}>✏️</Text>
              </Pressable>
              <Pressable onPress={handleDelete}>
                <Text style={styles.headerBtn}>🗑️</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        onScroll={(e) => { scrollOffsetY.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={100}
        onLayout={(e) => {
          const newHeight = e.nativeEvent.layout.height;
          const prevHeight = scrollViewHeight.current;
          scrollViewHeight.current = newHeight;
          if (Platform.OS === 'android' && editingNoteRef.current && newHeight < prevHeight) {
            requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
          }
        }}
      >
        {/* Hero image */}
        {cheese.imageUrl ? (
          <Image source={{ uri: cheese.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <CheeseWedgeSvg size={120} />
          </View>
        )}

        {/* Name + info chips */}
        <View style={styles.section}>
          <Text style={styles.cheeseName}>{cheese.name}</Text>
          <View style={styles.infoRow}>
            {cheese.texture && (
              <View style={styles.infoChip}><Text style={styles.infoChipText}>{TEXTURE_LABELS[cheese.texture] ?? cheese.texture}</Text></View>
            )}
            {cheese.milkType && (
              <View style={styles.infoChip}><Text style={styles.infoChipText}>{MILK_LABELS[cheese.milkType] ?? cheese.milkType}</Text></View>
            )}
            {cheese.cheeseFamily ? (
              <View style={styles.infoChip}><Text style={styles.infoChipText}>🧀 {cheese.cheeseFamily}</Text></View>
            ) : null}
            {cheese.agingPeriod ? (
              <View style={styles.infoChip}><Text style={styles.infoChipText}>⌛ {cheese.agingPeriod}</Text></View>
            ) : null}
            {cheese.origin ? (
              <View style={styles.infoChip}><Text style={styles.infoChipText}>📍 {cheese.origin}</Text></View>
            ) : null}
            {cheese.producer ? (
              <View style={styles.infoChip}><Text style={styles.infoChipText}>🏷️ {cheese.producer}</Text></View>
            ) : null}
          </View>
        </View>

        {/* Purchase locations */}
        {cheese.purchaseLocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aankooplocaties</Text>
            {cheese.purchaseLocations.map((loc) => (
              <Text key={loc} style={styles.locationText}>📍 {loc}</Text>
            ))}
          </View>
        )}

        {/* Other users' ratings */}
        {otherRatings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beoordelingen</Text>
            {otherRatings.map((r) => {
              const ratingUser = users.find((u) => u.id === r.userId);
              return (
                <View key={r.userId} style={styles.ratingBlock}>
                  <View style={styles.ratingRow}>
                    <View style={[styles.avatar, { backgroundColor: ratingUser?.color ?? Colors.border }]}>
                      <Text style={styles.avatarText}>
                        {(ratingUser?.name ?? '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.ratingUserName}>{ratingUser?.name ?? 'Onbekend'}</Text>
                    <RatingBadge rating={r.rating} />
                  </View>
                  {r.note ? <Text style={styles.noteText}>"{r.note}"</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {/* My rating */}
        <View style={[styles.section, styles.myRatingSection]}>
          <Text style={styles.sectionTitle}>Jouw beoordeling</Text>
          <RatingPicker value={myRating?.rating} onChange={handleRate} />

          {myRating && (
            <View style={styles.noteSection}>
              {editingNote ? (
                <View style={styles.noteEditRow}>
                  <TextInput
                    ref={noteInputRef}
                    style={styles.noteInput}
                    value={myNote}
                    onChangeText={setMyNote}
                    placeholder="Jouw smaaknotitie…"
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    autoFocus
                  />
                  <Pressable style={styles.saveNoteBtn} onPress={handleSaveNote}>
                    <Text style={styles.saveNoteBtnText}>Opslaan</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.noteDisplay} onPress={() => setEditingNote(true)}>
                  <Text style={styles.noteText}>
                    {myNote || 'Voeg een smaaknotitie toe…'}
                  </Text>
                  <Text style={styles.editHint}>Tikken om te bewerken</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 40 },
  headerBtns: { flexDirection: 'row', gap: 12, marginRight: 4 },
  headerBtn: { fontSize: 20 },
  heroImage: { width: '100%', height: 240, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  section: { padding: 20, gap: 12 },
  myRatingSection: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    margin: 16,
    marginTop: 0,
    ...Shadow.card,
  },
  cheeseName: { fontFamily: Fonts.heading, fontSize: 28, color: Colors.text },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  infoChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoChipText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  sectionTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  locationText: { fontFamily: Fonts.body, fontSize: 15, color: Colors.textSecondary },
  ratingBlock: { gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: '#FFFFFF' },
  ratingUserName: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.text, flex: 1 },
  noteText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic', paddingLeft: 42 },
  noteSection: { marginTop: 4 },
  noteEditRow: { gap: 8 },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 12,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveNoteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveNoteBtnText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: '#FFFFFF' },
  noteDisplay: { gap: 2 },
  editHint: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textMuted },
});
