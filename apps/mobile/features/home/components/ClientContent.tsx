import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { ReportCard } from "~/features/posts";
import { CommentsModal, Comment, Report } from "~/features/comments";
import { SearchModal } from "~/features/search";

interface ClientContentProps {
  reports: Report[];
  onCommentPress: (report: Report) => void;
  insets: any;
  refreshing: boolean;
  onRefresh: () => void;
  selectedReport: Report | null;
  commentsModalVisible: boolean;
  onCloseCommentsModal: () => void;
  onAddComment: (content: string) => void;
  searchModalVisible: boolean;
  onCloseSearchModal: () => void;
  onSelectReport: (report: Report) => void;
}

export default function ClientContent({
  reports,
  onCommentPress,
  insets,
  refreshing,
  onRefresh,
  selectedReport,
  commentsModalVisible,
  onCloseCommentsModal,
  onAddComment,
  searchModalVisible,
  onCloseSearchModal,
  onSelectReport,
}: ClientContentProps) {
  return (
    <>
      <ScrollView
        className="mt-4 px-4"
        contentContainerStyle={{ gap: 16, paddingBottom: insets.bottom + 12 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#537CF2"
            colors={['#537CF2']}
            progressBackgroundColor="#13161E"
          />
        }
      >
        {reports.map((report) => (
          <ReportCard
            id={report.id}
            key={report.id}
            title={report.title}
            author={report.author}
            timeAgo={report.timeAgo}
            image={report.image}
            upvotes={report.upvotes}
            onComment={() => onCommentPress(report)}
            onFollow={() => console.log("Seguir")}
            onMore={() => console.log("Más opciones")}
            onLocation={() => console.log("Ubicación")}
            onUpvote={() => console.log("Upvote")}
            onShare={() => console.log("Compartir")}
          />
        ))}
      </ScrollView>

      {selectedReport && (
        <CommentsModal
          visible={commentsModalVisible}
          onClose={onCloseCommentsModal}
          postTitle={selectedReport.title}
          comments={selectedReport.comments}
          onAddComment={onAddComment}
        />
      )}

      <SearchModal
        visible={searchModalVisible}
        onClose={onCloseSearchModal}
        reports={reports}
        onSelectReport={onSelectReport}
      />
    </>
  );
}