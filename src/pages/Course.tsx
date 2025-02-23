import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/course/CourseCard";
import VideoPlayer from "@/components/course/VideoPlayer";
import CourseQuiz from "@/components/course/CourseQuiz";

interface CourseType {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  is_free: boolean;
  video_id?: string;
  thumbnail_url?: string;
}

interface PythonSection {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

const pythonSections: PythonSection[] = [
  {
    id: 1,
    title: "Introduction to Python",
    description: "Learn the basics of Python programming language and its ecosystem.",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Basics of Python",
    description: "Master fundamental concepts like variables, data types, and control structures.",
    isCompleted: false,
  },
  {
    id: 3,
    title: "OOP Concepts in Python",
    description: "Understand object-oriented programming principles in Python.",
    isCompleted: false,
  },
  {
    id: 4,
    title: "Advanced Concepts in Python",
    description: "Explore advanced topics like decorators, generators, and metaclasses.",
    isCompleted: false,
  },
];

const Course = () => {
  const [searchTopic, setSearchTopic] = useState("");
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<boolean | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPythonModal, setShowPythonModal] = useState(false);
  const [sections, setSections] = useState<PythonSection[]>(pythonSections);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic to search",
        variant: "destructive",
      });
      return;
    }
    setShowTypeDialog(true);
  };

  const handleTypeSelection = (isFree: boolean) => {
    setSelectedType(isFree);
    setShowTypeDialog(false);
    setShowDifficultyDialog(true);
  };

  const handleDifficultySelection = async (difficulty: string) => {
    if (searchTopic.toLowerCase() === "python" && difficulty === "Beginner") {
      setShowPythonModal(true);
      return;
    }
    
    setSelectedDifficulty(difficulty);
    setShowDifficultyDialog(false);
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_free', selectedType)
        .eq('difficulty_level', difficulty.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);

      if (!data?.length) {
        toast({
          title: "No courses found",
          description: "Try different search criteria",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    }
  };

  const handleSectionComplete = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, isCompleted: true }
          : section
      )
    );
    toast({
      title: "Quiz Completed",
      description: "You've completed this section's quiz!",
    });
  };

  const handleVideoComplete = () => {
    setShowQuiz(true);
    setSelectedVideo("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Course Recommendations</h1>
          <p className="text-muted-foreground">
            Get personalized course recommendations based on your interests and skill level
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Enter a topic (e.g., Python, AI, Web Development)"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onVideoSelect={setSelectedVideo}
            />
          ))}
        </div>

        {/* Course Type Dialog */}
        <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Course Type</DialogTitle>
              <DialogDescription>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button onClick={() => handleTypeSelection(true)}>
                    <Book className="mr-2 h-4 w-4" />
                    Free Courses
                  </Button>
                  <Button onClick={() => handleTypeSelection(false)}>
                    <Book className="mr-2 h-4 w-4" />
                    Paid Courses
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Difficulty Level Dialog */}
        <Dialog open={showDifficultyDialog} onOpenChange={setShowDifficultyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Difficulty Level</DialogTitle>
              <DialogDescription>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {['Beginner', 'Intermediate', 'Hard', 'Expert'].map((level) => (
                    <Button
                      key={level}
                      onClick={() => handleDifficultySelection(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Python Sections Modal */}
        <Dialog open={showPythonModal} onOpenChange={setShowPythonModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">Python Course Curriculum</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-6 rounded-lg transition-colors duration-300 ${
                    section.isCompleted ? "bg-green-100" : "bg-white"
                  } border hover:border-primary`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <p className="text-muted-foreground mt-1">{section.description}</p>
                    </div>
                    <Button
                      onClick={() => handleSectionComplete(section.id)}
                      className="ml-4 transition-transform hover:scale-105"
                      variant={section.isCompleted ? "secondary" : "default"}
                    >
                      {section.isCompleted ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        "Take Quiz"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Player Dialog */}
        <VideoPlayer
          videoId={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo("")}
          onComplete={handleVideoComplete}
        />

        {/* Quiz Dialog */}
        <CourseQuiz
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          onRetry={() => setSelectedVideo(selectedVideo)}
        />
      </div>
    </div>
  );
};

export default Course;