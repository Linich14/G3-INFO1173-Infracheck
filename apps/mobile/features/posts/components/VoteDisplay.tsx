import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ArrowBigUp } from 'lucide-react-native';
import { useReportVotes } from '../hooks/useReportVotes';

interface VoteDisplayProps {
  reportId: string | number;
  initialVoteCount?: number;
  initialUserHasVoted?: boolean;
  onVotePress?: (reportId: string | number) => void;
  size?: 'small' | 'medium' | 'large';
  showLoading?: boolean;
}

const VoteDisplay: React.FC<VoteDisplayProps> = ({
  reportId,
  initialVoteCount = 0,
  initialUserHasVoted = false,
  onVotePress,
  size = 'medium',
  showLoading = true,
}) => {
  const { voteCount, userHasVoted, isLoading, isSubmitting, submitVote } = useReportVotes(
    reportId,
    initialVoteCount,
    initialUserHasVoted
  );

  const handlePress = () => {
    submitVote();
    onVotePress?.(reportId);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: styles.voteButtonSmall,
          icon: 16,
          text: styles.voteTextSmall,
        };
      case 'large':
        return {
          button: styles.voteButtonLarge,
          icon: 20,
          text: styles.voteTextLarge,
        };
      default: // medium
        return {
          button: styles.voteButtonMedium,
          icon: 18,
          text: styles.voteTextMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading || isSubmitting || userHasVoted}
      style={[
        sizeStyles.button,
        userHasVoted && styles.voteButtonActive
      ]}
      accessibilityLabel={`${voteCount} votos${userHasVoted ? ', ya has votado' : ', tocar para votar'}`}
      accessibilityRole="button"
    >
      {showLoading && (isLoading || isSubmitting) ? (
        <ActivityIndicator size="small" color={userHasVoted ? '#fff' : '#666'} />
      ) : (
        <>
          <ArrowBigUp size={sizeStyles.icon} color={userHasVoted ? '#fff' : '#666'} />
          <Text style={[sizeStyles.text, userHasVoted && styles.voteTextActive]}>
            {voteCount}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Botón mediano (default)
  voteButtonMedium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    minWidth: 60,
    justifyContent: 'center',
  },
  voteTextMedium: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  // Botón pequeño
  voteButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 3,
    minWidth: 48,
    justifyContent: 'center',
  },
  voteTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  // Botón grande
  voteButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    minWidth: 72,
    justifyContent: 'center',
  },
  voteTextLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  // Estados activos
  voteButtonActive: {
    backgroundColor: '#4A90E2',
  },
  voteTextActive: {
    color: '#fff',
  },
});

export default VoteDisplay;