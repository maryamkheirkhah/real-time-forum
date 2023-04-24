package db

import (
	"fmt"
	"testing"
)

func TestInsertData(t *testing.T) {
	//userId := 12
	//postId := 1
	//dt := time.Now()
	//creationTime := time.Now().Format("01-02-2006 15:04:05")

	var tests = [][]any{

		//test correct input
		//{"users", "testuser", "msdf@gmail.com", "1234", "12.12.2022"},
		//test missing data
		//{"posts", "testuser2", "first post", "hello world!", "12.12.2022"},
		//test missing table
		//
		{"reactions", 1, 2, -1, "like"},
	}
	//{"posts", 1, "first post", "hello world!", dt.Format("01-02-2006 15:04:05")},
	//{"comments", userId, postId, "first comment", "12.12.2022"}, ////////////////adding later
	/* 		{"topics", "art"},
	   		//test duplicate name
	   		{"topics", "sport"},
	   		{"topics", "music"},
	   		{"topics", "news"}, */
	for _, tt := range tests {
		// t.Run enables running "subtests", one for each
		// table entry. These are shown separately
		// when executing `go test -v`.
		testname := fmt.Sprintf("%s,", tt[0])
		t.Run(testname, func(t *testing.T) {
			if len(tt) == 5 {
				_, err := InsertData(tt[0].(string), tt[1], tt[2], tt[3], tt[4])
				if err != nil {
					t.Errorf("InsertData got error: %v:", err)

				}
			} else {
				_, err := InsertData(tt[0].(string), tt[1])
				if err != nil {
					t.Errorf("InsertData got error: %v:", err)

				}
			}
		})

	}

}

func TestSelectDataHandler(t *testing.T) {
	var tests = []struct {
		tableName, keyName, keyValue string

		want any
	}{
		//test correct input
		{"users", "userName", "userTest", nil},
	}

	for _, tt := range tests {
		// t.Run enables running "subtests", one for each
		// table entry. These are shown separately
		// when executing `go test -v`.
		testname := fmt.Sprintf("%s,%s", tt.tableName, tt.keyValue)
		t.Run(testname, func(t *testing.T) {
			_, err := SelectDataHandler(tt.tableName, tt.keyName, tt.keyValue)
			if err != nil {
				t.Errorf("SelectDataHandler got error: %v:", err)

			}
			/* 	if ans != tt.want {
				t.Errorf("got %d, want %d", ans, tt.want)
			} */
		})
	}

}
func TestUpdateSeenMessage(t *testing.T) {
	updateSeenMessage(46)
}
func TestDeleteData(t *testing.T) {
	var tests = []struct {
		tableName string
		key       any
	}{
		//test correct input
		//	{"users", "marikh"},

		//test missing data
		/* 		{"PostTopics", 4},
		   		{"PostTopics", 5}, */

		//test missing table
		//	{"users121", "marikh3"},
		/* 	{"topics", "art"},
		{"topics", "sport"},
		{"topics", "music"}, */
		//	{"posts", 15},
		//	{"topics", "news"},
	}
	for _, tt := range tests {
		// t.Run enables running "subtests", one for each
		// table entry. These are shown separately
		// when executing `go test -v`.
		testname := fmt.Sprintf("%s,%d", tt.tableName, tt.key)
		fmt.Println(testname)
		t.Run(testname, func(t *testing.T) {
			err := DeleteData(tt.tableName, tt.key)
			if err != nil {

				t.Errorf("DeleteData got error: %v:", err)

			}

		})
	}
}
func TestInsertReactionHandler(t *testing.T) {
	var tests = []struct {
		userID    int
		postID    int
		commentID int
		reaction  string
		want      any
	}{
		//test correct input
		{1, 1, -1, "check", nil},
		{1, 2, -1, "dislike", nil},
		{1, -1, 1, "likeComment", nil},
	}

	for _, tt := range tests {
		// t.Run enables running "subtests", one for each
		// table entry. These are shown separately
		// when executing `go test -v`.
		testname := fmt.Sprintf("%d,%s", tt.userID, tt.reaction)
		t.Run(testname, func(t *testing.T) {
			_, err := InsertData("reactions", tt.userID, tt.postID, tt.commentID, tt.reaction)
			if err != nil {
				t.Errorf("InsertReactionHandler got error: %v:", err)

			}
			/* 	if ans != tt.want {
				t.Errorf("got %d, want %d", ans, tt.want)
			} */
		})
	}

}
func TestSelectReactionHandler(t *testing.T) {
	var tests = []struct {
		tableName, keyName, keyValue string

		want any
	}{
		//test correct input
		{"users", "userName", "userTest", nil},
	}

	for _, tt := range tests {
		// t.Run enables running "subtests", one for each
		// table entry. These are shown separately
		// when executing `go test -v`.
		testname := fmt.Sprintf("%s,%s", tt.tableName, tt.keyValue)
		t.Run(testname, func(t *testing.T) {
			_, err := selectReactionHandler(tt.tableName, tt.keyName, tt.keyValue)
			if err != nil {
				t.Errorf("SelectReactionHandler got error: %v:", err)

			}
			/* 	if ans != tt.want {
				t.Errorf("got %d, want %d", ans, tt.want)
			} */
		})
	}

}
