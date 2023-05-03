package handlers

import (
	"testing"
)

func TestInsertData(t *testing.T) {
	err := insertPostToDB("Marikh", "first post", "Hello World!", "sport")
	if err != nil {
		t.Errorf("insertData got error: %v:", err)
	}
}
